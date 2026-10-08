"""PythonAnywhere entry point for the classic (WSGI) web app.

PythonAnywhere normally wants a module-level `application` WSGI callable, but
this service is ASGI (FastAPI). The bridge is to hand the process to uvicorn:
PythonAnywhere imports this file once per web worker, uvicorn takes over that
process, and their front end proxies requests to it over localhost.

Consequences worth knowing:

* Importing this module blocks forever. That is the intended behaviour, but it
  means a linter, a test runner or `python -c "import wsgi"` will hang rather
  than fail. Read `/var/log/<domain>.error.log` to debug instead of importing.
* There is no `--workers`, so the app runs single-process. The free plan gives
  one web worker anyway and the service is low traffic.

The newer ASGI route (`pa website create`, see DEPLOY.md) needs no file here at
all and is worth trying first. Keep this as the fallback for when the free plan
refuses beta ASGI sites.
"""

import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))

# PythonAnywhere runs this file from its own working directory, so the package
# sitting next to it is not importable until we say so.
if HERE not in sys.path:
    sys.path.insert(0, HERE)

from app.main import app  # noqa: E402
from uvicorn import Config, Server  # noqa: E402

# 0.0.0.0 would expose uvicorn directly if PythonAnywhere's front end were ever
# misconfigured; behind their proxy, localhost is enough.
_server = Server(
    Config(
        app,
        host="127.0.0.1",
        port=int(os.environ.get("PORT", "8000")),
        log_config=None,
    )
)

_server.run()

# Unreachable. Kept so the module still looks like a WSGI entry point to
# anything that introspects it.
application = app
