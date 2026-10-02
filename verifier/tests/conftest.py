import os

# Set before the app reads its settings.
os.environ["SERVICE_TOKEN"] = "test-token"
os.environ["GEMINI_API_KEY"] = "not-used-in-tests"
