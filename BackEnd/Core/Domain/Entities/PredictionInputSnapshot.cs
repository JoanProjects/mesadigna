using Core.Domain.Common;

namespace Core.Domain.Entities;

public class PredictionInputSnapshot : BaseEntity
{
    public int PortionPredictionId { get; set; }

    public int DayOfWeek { get; set; }

    public int TotalActiveBeneficiaries { get; set; }

    public int ElderlyCount { get; set; }

    public int MinorsCount { get; set; }

    public int DietaryRestrictionsCount { get; set; }

    public int HypertensionCount { get; set; }

    public int DiabetesCount { get; set; }

    public int PreviousDayAttendance { get; set; }

    public double AttendanceLast7DaysAvg { get; set; }

    public double AttendanceLast30DaysAvg { get; set; }

    public string? RawInputJson { get; set; }

    // ── Navigation ──────────────────────────────────────────
    public PortionPrediction Prediction { get; set; } = null!;
}
