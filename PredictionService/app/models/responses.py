from pydantic import BaseModel, Field


class DietaryPortionBreakdown(BaseModel):
    regular: int = Field(..., description="Porciones regulares sin restricciones")
    hypertension: int = Field(default=0, description="Porciones para hipertensos")
    diabetes: int = Field(default=0, description="Porciones para diabéticos")
    allergies: int = Field(default=0, description="Porciones para alérgicos")
    special_diet: int = Field(default=0, description="Otras restricciones alimentarias")


class EvaluationMetrics(BaseModel):
    mae: float = Field(..., description="Mean Absolute Error — promedio de error absoluto")
    rmse: float = Field(..., description="Root Mean Squared Error — error cuadrático medio")
    r2_score: float = Field(..., description="R² — coeficiente de determinación (1.0 = perfecto)")
    test_samples: int = Field(default=0, description="Cantidad de muestras en test set")


class PredictionMetadata(BaseModel):
    model_name: str = Field(default="RandomForestRegressor")
    model_version: str = Field(default="2.0.0")
    features_used: list[str] = Field(default_factory=list)
    training_samples: int = Field(default=0)
    feature_importances: dict[str, float] = Field(
        default_factory=dict,
        description="Importancia de cada feature según el modelo entrenado"
    )


class PredictionResponse(BaseModel):
    target_date: str
    recommended_portions: int = Field(..., description="Total de porciones recomendadas")
    regular_portions: int = Field(..., description="Porciones regulares")
    special_diet_portions: int = Field(..., description="Porciones de dieta especial")
    confidence: float = Field(
        ..., ge=0, le=1,
        description="Confianza puntual de esta predicción (0-1). "
                    "Mide la concordancia entre árboles del modelo para este input específico."
    )
    dietary_breakdown: DietaryPortionBreakdown
    metadata: PredictionMetadata
    generated_at: str = Field(..., description="Timestamp UTC de generación (ISO 8601)")
    evaluation_metrics: EvaluationMetrics | None = Field(
        default=None,
        description="Métricas globales del modelo (MAE, RMSE, R²). "
                    "No es confianza puntual: es calidad general del modelo evaluada en test set."
    )


class ModelInfoResponse(BaseModel):
    model_name: str
    model_version: str
    training_samples: int
    features_used: list[str]
    feature_importances: dict[str, float]
    evaluation_metrics: EvaluationMetrics | None = None
    last_trained_at: str | None = None


class RetrainResponse(BaseModel):
    model_version: str
    training_samples: int
    evaluation_metrics: EvaluationMetrics
    feature_importances: dict[str, float]
    last_trained_at: str
