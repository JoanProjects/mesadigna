from pydantic import BaseModel, Field


class AttendanceHistory(BaseModel):
    date: str = Field(..., description="Fecha en formato yyyy-MM-dd")
    count: int = Field(..., ge=0, description="Cantidad de asistentes")


class DietaryDistribution(BaseModel):
    hypertension_count: int = Field(default=0, ge=0)
    diabetes_count: int = Field(default=0, ge=0)
    allergies_count: int = Field(default=0, ge=0)
    dietary_restrictions_count: int = Field(default=0, ge=0)


class AgeDistribution(BaseModel):
    minors_count: int = Field(default=0, ge=0, description="Menores de 18 años")
    elderly_count: int = Field(default=0, ge=0, description="Mayores de 65 años")
    adults_count: int = Field(default=0, ge=0, description="Adultos 18-64 años")


class PredictionRequest(BaseModel):
    target_date: str = Field(..., description="Fecha objetivo en formato yyyy-MM-dd")
    total_active_beneficiaries: int = Field(..., ge=0)
    dietary_distribution: DietaryDistribution = Field(default_factory=DietaryDistribution)
    age_distribution: AgeDistribution = Field(default_factory=AgeDistribution)
    attendance_history: list[AttendanceHistory] = Field(
        default_factory=list,
        description="Historial de asistencia de los últimos 30 días"
    )
    previous_day_attendance: int = Field(default=0, ge=0)
    attendance_last_7_days_avg: float = Field(default=0.0, ge=0)
    attendance_last_30_days_avg: float = Field(default=0.0, ge=0)


class TrainingDataPoint(BaseModel):
    date: str = Field(..., description="Fecha en formato yyyy-MM-dd")
    day_of_week: int = Field(..., ge=0, le=6)
    total_beneficiaries: int = Field(..., ge=0)
    elderly_count: int = Field(default=0, ge=0)
    minors_count: int = Field(default=0, ge=0)
    dietary_restrictions_count: int = Field(default=0, ge=0)
    hypertension_count: int = Field(default=0, ge=0)
    diabetes_count: int = Field(default=0, ge=0)
    previous_day_attendance: int = Field(default=0, ge=0)
    attendance_last_7_days_avg: float = Field(default=0.0, ge=0.0)
    attendance_last_30_days_avg: float = Field(default=0.0, ge=0.0)
    is_weekend: int = Field(default=0, ge=0, le=1)
    attendance_trend: float = Field(default=0.0)
    beneficiary_attendance_ratio: float = Field(default=0.0, ge=0.0)
    actual_attendance: int = Field(..., ge=0, description="Asistencia real registrada")


class RetrainRequest(BaseModel):
    training_data: list[TrainingDataPoint] = Field(
        ..., min_length=30, description="Mínimo 30 puntos de datos con asistencia real"
    )
