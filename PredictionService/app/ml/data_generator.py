import numpy as np
from typing import Tuple


def generate_training_data(n_samples: int = 2000, seed: int = 42) -> Tuple[np.ndarray, np.ndarray]:
    """
    Genera datos de entrenamiento simulados para el modelo de predicción de porciones.

    Simula patrones realistas de un comedor comunitario:
    - Más asistencia entre semana que fines de semana
    - Correlación entre beneficiarios activos y asistencia
    - Efecto de principio/fin de mes
    - Variación estacional
    - Tendencias de asistencia

    Features (13 total):
        0: day_of_week (0=Lun, 6=Dom)
        1: total_beneficiaries (50-300)
        2: elderly_count (5-60)
        3: minors_count (3-40)
        4: dietary_restrictions_count (2-30)
        5: hypertension_count (3-25)
        6: diabetes_count (2-20)
        7: previous_day_attendance (20-200)
        8: attendance_last_7_days_avg (30-180)
        9: attendance_last_30_days_avg (30-180)
        10: is_weekend (0 o 1)
        11: attendance_trend (avg_7 - avg_30, positivo = tendencia al alza)
        12: beneficiary_attendance_ratio (avg_30 / total_beneficiaries)

    Returns:
        X: Feature matrix (n_samples, 13)
        y: Target values (attendance/portions)
    """
    rng = np.random.RandomState(seed)

    # --- Features base ---
    day_of_week = rng.randint(0, 7, n_samples)
    total_beneficiaries = rng.randint(50, 301, n_samples)

    # Distribución demográfica correlacionada
    elderly_pct = rng.uniform(0.10, 0.25, n_samples)
    elderly_count = (total_beneficiaries * elderly_pct).astype(int)
    minors_count = (total_beneficiaries * rng.uniform(0.05, 0.15, n_samples)).astype(int)

    # Restricciones dietarias — correlacionadas con edad avanzada
    dietary_restrictions_count = (total_beneficiaries * rng.uniform(0.05, 0.12, n_samples)).astype(int)
    hypertension_count = (elderly_count * rng.uniform(0.3, 0.6, n_samples)).astype(int)
    diabetes_count = (total_beneficiaries * rng.uniform(0.03, 0.10, n_samples)).astype(int)

    # --- Efectos sobre asistencia ---
    base_rate = rng.uniform(0.50, 0.85, n_samples)

    # Efecto día de semana: fines de semana bajan ~30%
    is_weekend = (day_of_week >= 5).astype(int)
    day_effect = np.where(is_weekend, 0.70, 1.0)

    # Efecto principio de mes: ligero aumento (simula primeros 5 días)
    day_of_month = rng.randint(1, 31, n_samples)
    month_start_effect = np.where(day_of_month <= 5, 1.05, 1.0)

    # Efecto estacional: meses fríos (nov-feb) tienen ~8% más asistencia
    month = rng.randint(1, 13, n_samples)
    seasonal_effect = np.where((month >= 11) | (month <= 2), 1.08, 1.0)

    # Calcular asistencia realista con todos los efectos
    attendance = (
        total_beneficiaries * base_rate * day_effect * month_start_effect * seasonal_effect
    ).astype(int)
    noise = rng.normal(0, 5, n_samples).astype(int)
    attendance = np.clip(attendance + noise, 10, total_beneficiaries)

    # --- Features derivadas de historial ---
    prev_day_attendance = np.clip(
        attendance + rng.randint(-20, 21, n_samples), 10, total_beneficiaries
    )
    avg_7 = np.clip(
        attendance + rng.normal(0, 8, n_samples), 10, total_beneficiaries
    ).round(1)
    avg_30 = np.clip(
        attendance + rng.normal(0, 12, n_samples), 10, total_beneficiaries
    ).round(1)

    # --- Features derivadas calculadas ---
    attendance_trend = np.round(avg_7 - avg_30, 2)
    beneficiary_attendance_ratio = np.round(
        np.where(total_beneficiaries > 0, avg_30 / total_beneficiaries, 0.0), 4
    )

    X = np.column_stack([
        day_of_week,
        total_beneficiaries,
        elderly_count,
        minors_count,
        dietary_restrictions_count,
        hypertension_count,
        diabetes_count,
        prev_day_attendance,
        avg_7,
        avg_30,
        is_weekend,
        attendance_trend,
        beneficiary_attendance_ratio,
    ])

    y = attendance.astype(float)

    return X, y
