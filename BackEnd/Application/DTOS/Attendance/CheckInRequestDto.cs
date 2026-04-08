using System.ComponentModel.DataAnnotations;

namespace Application.DTOS.Attendance;

public class CheckInRequestDto
{
    public int? BeneficiaryId { get; set; }

    [StringLength(20)]
    public string? InternalCode { get; set; }

    [StringLength(20)]
    public string CheckInMethod { get; set; } = "Manual";

    [StringLength(500)]
    public string? Notes { get; set; }
}
