import numpy as np
from datetime import datetime
from app.models.requests import PredictionRequest, RetrainRequest
from app.models.responses import (
    PredictionResponse,
    DietaryPortionBreakdown,
    PredictionMetadata,
    EvaluationMetrics,
    ModelInfoResponse,
    RetrainResponse,
)
from app.ml.model import PortionPredictionModel


class PredictionService:
    """
    Manages predictions for dietary portions based on historical data and dietary restrictions.

    This class interfaces with a trained machine learning model to provide predictions for
    the recommended quantity of food portions, broken down into regular and special dietary
    categories. It supports retrieving information about the model, making predictions,
    and retraining the model with new historical data.

    :ivar model: The underlying machine learning model utilized for predictions.
    :type model: PortionPredictionModel
    """

    def __init__(self):
        self.model = PortionPredictionModel()
        self.model.ensure_trained()

    def predict(self, request: PredictionRequest) -> PredictionResponse:
        # Parse target date
        target_date = datetime.strptime(request.target_date, "%Y-%m-%d")
        day_of_week = target_date.weekday()  # 0=Monday, 6=Sunday

        # Build feature vector (13 features)
        features = self._build_features(request, day_of_week)

        # Get prediction from ML model
        predicted_total, confidence = self.model.predict(features)

        # --- Distribución dietaria inteligente ---
        dietary = request.dietary_distribution
        total_beneficiaries = max(request.total_active_beneficiaries, 1)

        # Calcular porciones especiales basándose en la proporción real
        # de cada restricción respecto al total de beneficiarios
        hypertension_portions = self._proportional_portions(
            dietary.hypertension_count, total_beneficiaries, predicted_total
        )
        diabetes_portions = self._proportional_portions(
            dietary.diabetes_count, total_beneficiaries, predicted_total
        )
        allergies_portions = self._proportional_portions(
            dietary.allergies_count, total_beneficiaries, predicted_total
        )
        special_diet_other = self._proportional_portions(
            dietary.dietary_restrictions_count, total_beneficiaries, predicted_total
        )

        total_special = hypertension_portions + diabetes_portions + allergies_portions + special_diet_other

        # Aplicar margen de seguridad (10% extra para evitar faltantes)
        safety_margin = 1.10
        recommended = int(np.ceil(predicted_total * safety_margin))

        # Asegurar que special no exceda el total recomendado
        special_portions = min(total_special, recommended)
        regular_portions = max(recommended - special_portions, 0)

        # Build dietary breakdown con porciones proporcionales
        dietary_breakdown = DietaryPortionBreakdown(
            regular=regular_portions,
            hypertension=hypertension_portions,
            diabetes=diabetes_portions,
            allergies=allergies_portions,
            special_diet=special_diet_other,
        )

        # Build evaluation metrics si existen
        eval_metrics = None
        if self.model.evaluation_metrics:
            m = self.model.evaluation_metrics
            eval_metrics = EvaluationMetrics(
                mae=m["mae"],
                rmse=m["rmse"],
                r2_score=m["r2_score"],
                test_samples=m.get("test_samples", 0),
            )

        return PredictionResponse(
            target_date=request.target_date,
            recommended_portions=recommended,
            regular_portions=regular_portions,
            special_diet_portions=special_portions,
            confidence=confidence,
            dietary_breakdown=dietary_breakdown,
            metadata=PredictionMetadata(
                model_name=self.model.model_name,
                model_version=self.model.model_version,
                features_used=self.model.feature_names,
                training_samples=self.model.training_samples,
                feature_importances=self.model.feature_importances,
            ),
            generated_at=datetime.utcnow().isoformat() + "Z",
            evaluation_metrics=eval_metrics,
        )

    def get_model_info(self) -> ModelInfoResponse:
        """Retorna información completa del modelo actual."""
        info = self.model.get_model_info()

        eval_metrics = None
        if info["evaluation_metrics"]:
            m = info["evaluation_metrics"]
            eval_metrics = EvaluationMetrics(
                mae=m["mae"],
                rmse=m["rmse"],
                r2_score=m["r2_score"],
                test_samples=m.get("test_samples", 0),
            )

        return ModelInfoResponse(
            model_name=info["model_name"],
            model_version=info["model_version"],
            training_samples=info["training_samples"],
            features_used=info["features_used"],
            feature_importances=info["feature_importances"],
            evaluation_metrics=eval_metrics,
            last_trained_at=info["last_trained_at"],
        )

    def retrain(self, request: RetrainRequest) -> RetrainResponse:
        """Reentrena el modelo con datos históricos reales."""
        # Construir matrices X, y desde los datos de entrenamiento
        X = np.array([
            [
                dp.day_of_week,
                dp.total_beneficiaries,
                dp.elderly_count,
                dp.minors_count,
                dp.dietary_restrictions_count,
                dp.hypertension_count,
                dp.diabetes_count,
                dp.previous_day_attendance,
                dp.attendance_last_7_days_avg,
                dp.attendance_last_30_days_avg,
                dp.is_weekend,
                dp.attendance_trend,
                dp.beneficiary_attendance_ratio,
            ]
            for dp in request.training_data
        ])
        y = np.array([dp.actual_attendance for dp in request.training_data], dtype=float)

        result = self.model.retrain(X, y)

        return RetrainResponse(
            model_version=result["model_version"],
            training_samples=result["training_samples"],
            evaluation_metrics=EvaluationMetrics(
                mae=result["evaluation_metrics"]["mae"],
                rmse=result["evaluation_metrics"]["rmse"],
                r2_score=result["evaluation_metrics"]["r2_score"],
                test_samples=result["evaluation_metrics"].get("test_samples", 0),
            ),
            feature_importances=result["feature_importances"],
            last_trained_at=result["last_trained_at"],
        )

    def _build_features(
        self, request: PredictionRequest, day_of_week: int
    ) -> np.ndarray:
        """Construye el vector de 13 features para el modelo ML."""
        total = max(request.total_active_beneficiaries, 1)
        avg_7 = request.attendance_last_7_days_avg
        avg_30 = request.attendance_last_30_days_avg

        # Features derivadas calculadas en Python
        is_weekend = 1 if day_of_week >= 5 else 0
        attendance_trend = round(avg_7 - avg_30, 2)
        beneficiary_attendance_ratio = round(avg_30 / total, 4) if total > 0 else 0.0

        return np.array(
            [
                [
                    day_of_week,
                    request.total_active_beneficiaries,
                    request.age_distribution.elderly_count,
                    request.age_distribution.minors_count,
                    request.dietary_distribution.dietary_restrictions_count
                    + request.dietary_distribution.allergies_count,
                    request.dietary_distribution.hypertension_count,
                    request.dietary_distribution.diabetes_count,
                    request.previous_day_attendance,
                    avg_7,
                    avg_30,
                    is_weekend,
                    attendance_trend,
                    beneficiary_attendance_ratio,
                ]
            ]
        )

    @staticmethod
    def _proportional_portions(
        restriction_count: int, total_beneficiaries: int, predicted_total: float
    ) -> int:
        if restriction_count <= 0:
            return 0
        proportion = restriction_count / max(total_beneficiaries, 1)
        portions = int(np.ceil(predicted_total * proportion))
        return max(portions, 1)  # Mínimo 1 porción si hay beneficiarios con esta restricción
