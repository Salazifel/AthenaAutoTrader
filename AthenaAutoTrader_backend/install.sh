python -m venv .venv
chmod +x .venv/bin/activate && source .venv/bin/activate

pip install -r requirements.txt

uvicorn main:app --reload --port 8000
