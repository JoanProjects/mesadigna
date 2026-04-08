namespace Application.DTOS.Prediction;

public class TrainingDataPointDto
{
    public string Date { get; set; } = string.Empty;
    public int DayOfWeek { get; set; }
    public int TotalBeneficiaries { get; set; }
    public int ElderlyCount { get; set; }
    public int MinorsCount { get; set; }
    public int DietaryRestrictionsCount { get; set; }
    public int HypertensionCount { get; set; }
    public int DiabetesCount { get; set; }
    public int PreviousDayAttendance { get; set; }
    public double AttendanceLast7DaysAvg { get; set; }
    public double AttendanceLast30DaysAvg { get; set; }
    public int IsWeekend { get; set; }
    public double AttendanceTrend { get; set; }
    public double BeneficiaryAttendanceRatio { get; set; }
    public int ActualAttendance { get; set; }
}
