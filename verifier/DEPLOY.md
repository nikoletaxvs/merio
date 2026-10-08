# Deploying the verifier to PythonAnywhere

The verifier is the only part of Merio that runs on Python. Everything else stays
on Vercel, so this runbook covers only `merio/verifier`.

The free (Beginner) plan is enough. What you get and what it costs you:

| | Free plan |
| --- | --- |
| Web app | `your-username.pythonanywhere.com`, HTTP only |
| Web workers | 1 |
| Outbound internet | allowlisted domains, through a proxy |
| Disk | 512 MB (this service needs ~60 MB) |

Two of those need explaining.

**HTTP only is fine.** Merio calls the verifier from the Next.js *server*
(`lib/verify-receipt.ts` runs under `"server-only"`), never from a browser, so
no mixed-content rules apply. Don't move that fetch to the client.

**The outbound allowlist contains `.googleapis.com`**, which is what the Gemini
client talks to. Free accounts route outbound traffic through a proxy set in
`HTTPS_PROXY`; `google-genai` builds its httpx client with `trust_env=True`, so
it picks that up on its own. This is the one thing to prove works before you
trust the deployment, and the "Check it works" section below does exactly that.

The 100 CPU-seconds/day allowance does **not** apply to web apps, only to
consoles and scheduled tasks.

## Set up the account

1. Sign up for a free account. Note whether it landed on the US or EU system:
   the subdomain differs (`your-username.pythonanywhere.com` vs
   `your-username.eu.pythonanywhere.com`).

2. In a Bash console, create a virtualenv on Python 3.12 to match local:

   ```bash
   mkvirtualenv verifier --python=python3.12
   ```

3. Upload the code. In the Files page or over the console, put `app/` and
   `requirements-pa.txt` in `/home/your-username/verifier/`. Leave `tests/`,
   `evals/`, `.venv/` and `.env` behind — the free plan caps the number of files
   in the web app directory, and shipping the test set serves no purpose.

   The repo's `verifier/` directory is already laid out as the unit, so:

   ```bash
   # from a local clone, in verifier/
   zip -r verifier-upload.zip app requirements.txt requirements-pa.txt
   ```

4. Install the dependencies into that virtualenv:

   ```bash
   pip install -r /home/your-username/verifier/requirements-pa.txt
   ```

5. Set the secrets. `app/config.py` calls `load_dotenv()`, which reads `~/.env`,
   so put them one level above the code rather than next to it:

   ```bash
   nano ~/.env
   ```

   ```
   GEMINI_API_KEY=your-key-from-aistudio
   GEMINI_MODEL=gemini-2.5-flash
   SERVICE_TOKEN=<same value as VERIFIER_TOKEN in the Merio deployment>
   ```

   `SERVICE_TOKEN` has no default and `require_service_token` fails closed
   without it, so `/verify` returns 401 until you set it. Generate one with
   `openssl rand -hex 32`.

## Publish the app

Try the ASGI route first. It's what PythonAnywhere recommends for FastAPI, needs
no entry-point file, and talks over a unix socket instead of a TCP port:

```bash
pip install --upgrade pythonanywhere

pa website create \
  --domain your-username.pythonanywhere.com \
  --command '/home/your-username/.virtualenvs/verifier/bin/uvicorn --app-dir /home/your-username/verifier app.main:app --uds ${DOMAIN_SOCKET}'
```

Then `pa website reload --domain your-username.pythonanywhere.com` after every
code change, and read `/var/log/<domain>.error.log` when something breaks.

This is a beta feature with no web UI, and PythonAnywhere has said long-term ASGI
pricing is undecided. If the free account refuses the command, fall back to a
classic WSGI web app:

1. Web tab → Add a new web app → Manual configuration.
2. Source code: `/home/your-username/verifier`.
3. Virtualenv: `/home/your-username/.virtualenvs/verifier`.
4. **WSGI configuration file**: `/home/your-username/verifier/wsgi.py`. The file
   is already in the source directory, so PythonAnywhere picks it up as-is.
5. Reload.

`wsgi.py` runs uvicorn on `127.0.0.1:$PORT` and takes over the worker process.
It blocks on import by design, so the config check appears to hang; reload once
and read `/var/log/<domain>.error.log`.

## Check it works

```bash
# 1. The app is up
curl http://your-username.pythonanywhere.com/health
# {"status":"ok"}

# 2. It refuses an unauthenticated call, so the token is being read
curl -X POST http://your-username.pythonanywhere.com/verify
# {"detail":"Invalid service token"}

# 3. The proxy reaches Gemini. This is the one that can fail on the free plan.
curl -X POST http://your-username.pythonanywhere.com/verify \
  -H "X-Service-Token: $SERVICE_TOKEN" \
  -F image=@a-screenshot.png \
  -F expected_amount=3.40 \
  -F period_start=2026-10-01
```

Use a screenshot you also know the answer for, so a `needs_review` is clearly the
model's verdict rather than a transport failure.

If step 3 returns `{"status":"needs_review","reasons":["extraction_failed"]}`,
the app is fine and the Gemini call is being blocked or is failing to
authenticate. The error log carries the underlying exception. Note that
`extraction_failed` is also the service's answer to a genuinely bad key, so read
the log rather than guessing.

Once it answers, set `VERIFIER_URL` and `VERIFIER_TOKEN` on the Vercel
deployment and redeploy.

## What you'd be giving up

Render or Fly take the `Dockerfile` in this directory as-is and give you HTTPS
on a real domain, unrestricted outbound traffic and no proxy to debug. The case
for PythonAnywhere is that it needs no card and doesn't sleep, not that it's a
better host.
