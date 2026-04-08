namespace Application.DTOS.Prediction;

public class PredictionInputSnapshotDto
{
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
}
