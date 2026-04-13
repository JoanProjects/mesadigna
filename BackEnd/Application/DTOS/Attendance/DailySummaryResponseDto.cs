namespace Application.DTOS.Attendance;

public class DailySummaryResponseDto
{
    public string Date { get; set; } = string.Empty;
    public int TotalAttendees { get; set; }
    public int TotalMale { get; set; }
    public int TotalFemale { get; set; }
    public int TotalOther { get; set; }
    public int TotalMinors { get; set; }
    public int TotalAdults { get; set; }
    public int TotalElders { get; set; }
}
