import numpy as np
import joblib
import os
from datetime import datetime
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from app.ml.data_generator import generate_training_data

MODEL_PATH = os.path.join(os.path.dirname(__file__), "trained_model.joblib")


class PortionPredictionModel:
    """Modelo de predicción de porciones basado en RandomForestRegressor."""

    model_name = "RandomForestRegressor"
    model_version = "2.0.0"

    feature_names = [
        "day_of_week",
        "total_beneficiaries",
        "elderly_count",
        "minors_count",
        "dietary_restrictions_count",
        "hypertension_count",
        "diabetes_count",
        "previous_day_attendance",
        "attendance_last_7_days_avg",
        "attendance_last_30_days_avg",
        "is_weekend",
        "attendance_trend",
        "beneficiary_attendance_ratio",
    ]

    def __init__(self):
        self.model: RandomForestRegressor | None = None
        self.training_samples: int = 0
        self.evaluation_metrics: dict = {}
        self.feature_importances: dict[str, float] = {}
        self.last_trained_at: str | None = None

    def ensure_trained(self):
        """Carga modelo existente o entrena uno nuevo con datos simulados."""
        if os.path.exists(MODEL_PATH):
            self._load_model()
        else:
            self._train_with_simulated_data()

    def _load_model(self):
        data = joblib.load(MODEL_PATH)
        self.model = data["model"]
        self.training_samples = data["training_samples"]
        self.evaluation_metrics = data.get("evaluation_metrics", {})
        self.feature_importances = data.get("feature_importances", {})
        self.last_trained_at = data.get("last_trained_at")

    def _save_model(self):
        joblib.dump(
            {
                "model": self.model,
                "training_samples": self.training_samples,
                "evaluation_metrics": self.evaluation_metrics,
                "feature_importances": self.feature_importances,
                "last_trained_at": self.last_trained_at,
            },
            MODEL_PATH,
        )

    def _train_with_simulated_data(self):
        """Entrena el modelo con datos simulados para uso inicial."""
        X, y = generate_training_data(n_samples=2000)
        self._fit_and_evaluate(X, y)

    def _fit_and_evaluate(self, X: np.ndarray, y: np.ndarray):
        """Entrena el modelo con train/test split y calcula métricas de evaluación."""
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )

        self.model = RandomForestRegressor(
            n_estimators=200, max_depth=15, random_state=42, n_jobs=-1
        )
        self.model.fit(X_train, y_train)
        self.training_samples = len(y_train)

        # Evaluar en conjunto de test
        y_pred = self.model.predict(X_test)
        mae = mean_absolute_error(y_test, y_pred)
        rmse = float(np.sqrt(mean_squared_error(y_test, y_pred)))
        r2 = r2_score(y_test, y_pred)

        self.evaluation_metrics = {
            "mae": round(mae, 4),
            "rmse": round(rmse, 4),
            "r2_score": round(r2, 4),
            "test_samples": len(y_test),
        }

        # Feature importances
        importances = self.model.feature_importances_
        self.feature_importances = {
            name: round(float(imp), 6)
            for name, imp in zip(self.feature_names, importances)
        }

        self.last_trained_at = datetime.utcnow().isoformat() + "Z"
        self._save_model()

    def predict(self, features: np.ndarray) -> tuple[float, float]:
        """
        Genera predicción y estimación de confianza para una predicción puntual.

        La confianza mide cuán seguros están los árboles individuales sobre
        esta predicción específica. Un valor alto indica que la mayoría de
        árboles coinciden, un valor bajo indica dispersión.

        Returns: (predicted_portions, confidence_score)
        """
        if self.model is None:
            raise RuntimeError("Modelo no entrenado. Llame ensure_trained() primero.")

        prediction = self.model.predict(features)[0]

        # Confianza puntual: basada en dispersión de predicciones entre árboles
        tree_predictions = np.array(
            [tree.predict(features)[0] for tree in self.model.estimators_]
        )
        std_dev = np.std(tree_predictions)
        mean_pred = np.mean(tree_predictions)

        # Confidence: menor variación relativa al promedio = mayor confianza
        # Se normaliza a rango 0-1 usando coeficiente de variación
        cv = std_dev / max(mean_pred, 1)
        confidence = max(0.0, min(1.0, 1.0 - cv))

        return max(prediction, 0), round(confidence, 4)

    def retrain(self, X: np.ndarray, y: np.ndarray) -> dict:
        """
        Reentrena el modelo con datos reales.

        Returns: dict con métricas de evaluación del nuevo modelo.
        """
        self._fit_and_evaluate(X, y)
        return {
            "model_version": self.model_version,
            "training_samples": self.training_samples,
            "evaluation_metrics": self.evaluation_metrics,
            "feature_importances": self.feature_importances,
            "last_trained_at": self.last_trained_at,
        }

    def get_model_info(self) -> dict:
        """Retorna información completa del modelo actual."""
        return {
            "model_name": self.model_name,
            "model_version": self.model_version,
            "training_samples": self.training_samples,
            "features_used": self.feature_names,
            "feature_importances": self.feature_importances,
            "evaluation_metrics": self.evaluation_metrics,
            "last_trained_at": self.last_trained_at,
        }
