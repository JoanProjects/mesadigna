using Core.Domain.Common;

namespace Core.Domain.Entities;

public class Attendance : BaseEntity
{
    public int BeneficiaryId { get; set; }

    public DateOnly ServiceDate { get; set; }
    

    public DateTime CheckInTime { get; set; }

    public string CheckInMethod { get; set; } = "Manual";

    public string? Notes { get; set; }

    // ── Navigation ──────────────────────────────────────────
    public Beneficiary Beneficiary { get; set; } = null!;
}
