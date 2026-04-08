namespace Application.DTOS.Prediction;

public class PythonPredictionRequestDto
{
    public string TargetDate { get; set; } = string.Empty;
    public int TotalActiveBeneficiaries { get; set; }
    public DietaryDistributionDto DietaryDistribution { get; set; } = new();
    public AgeDistributionDto AgeDistribution { get; set; } = new();
    public List<AttendanceHistoryItemDto> AttendanceHistory { get; set; } = [];
    public int PreviousDayAttendance { get; set; }
    public double AttendanceLast7DaysAvg { get; set; }
    public double AttendanceLast30DaysAvg { get; set; }
}
