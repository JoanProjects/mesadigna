from fastapi import APIRouter, HTTPException
from app.models.requests import PredictionRequest, RetrainRequest
from app.models.responses import PredictionResponse, ModelInfoResponse, RetrainResponse
from app.services.prediction_service import PredictionService

router = APIRouter()
prediction_service = PredictionService()


@router.post("/predict-portions", response_model=PredictionResponse)
async def predict_portions(request: PredictionRequest):
    try:
        result = prediction_service.predict(request)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error en predicción: {str(e)}")


@router.get("/model/info", response_model=ModelInfoResponse)
async def get_model_info():
    try:
        return prediction_service.get_model_info()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error obteniendo info del modelo: {str(e)}")


@router.post("/model/retrain", response_model=RetrainResponse)
async def retrain_model(request: RetrainRequest):
    try:
        return prediction_service.retrain(request)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error en reentrenamiento: {str(e)}")
