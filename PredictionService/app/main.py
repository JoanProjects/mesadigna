from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import prediction_router, health_router

app = FastAPI(
    title="MesaDigna Prediction Service",
    description="Microservicio de predicción de porciones para el comedor comunitario MesaDigna.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router, tags=["Health"])
app.include_router(prediction_router, prefix="/api", tags=["Predictions"])
