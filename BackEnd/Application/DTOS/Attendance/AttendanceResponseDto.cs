namespace Application.DTOS.Attendance;

public class AttendanceResponseDto
{
    public int Id { get; set; }
    public int BeneficiaryId { get; set; }
    public string BeneficiaryName { get; set; } = string.Empty;
    public string BeneficiaryInternalCode { get; set; } = string.Empty;
    public string ServiceDate { get; set; } = string.Empty;
    public DateTime CheckInTime { get; set; }
    public string CheckInMethod { get; set; } = string.Empty;
    public string? Notes { get; set; }
}
