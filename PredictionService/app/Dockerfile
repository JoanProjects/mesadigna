FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Train model on startup if not present
RUN python -c "from app.ml.model import PortionPredictionModel; m = PortionPredictionModel(); m.ensure_trained()"

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
