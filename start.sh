# only works on Mac and Linux

# Start backend
cd AthenaAutoTrader_backend || exit 1

# Set up virtual environment if it doesn't exist
[ -d .venv ] || python -m venv .venv
source .venv/bin/activate

# Install backend dependencies
pip install -r requirements.txt

# Start backend in background
uvicorn main:app --reload --port 8000 &
BACKEND_PID=$!

# Define cleanup function
cleanup() {
    echo "Killing backend server (PID $BACKEND_PID)..."
    kill $BACKEND_PID
}
trap cleanup EXIT

# Start frontend
cd ../AthenaAutoTrader || exit 1
npm install
npm run dev
FRONTEND_PID=$!