using Core.Domain.Common;
using Core.Domain.Enums;

namespace Core.Domain.Entities;

public class Beneficiary : BaseEntity
{
    public string InternalCode { get; set; } = string.Empty;

    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public DateTime DateOfBirth { get; set; }
    public Sex Sex { get; set; }

    public string? IdentityDocument { get; set; }

    public string? PhoneNumber { get; set; }
    public string? Address { get; set; }

    public string? EmergencyContact { get; set; }

    public BeneficiaryStatus Status { get; set; } = BeneficiaryStatus.Activo;
    public string? Notes { get; set; }

    public DateTime RegisteredAt { get; set; }

    // ── Navigation ──────────────────────────────────────────
    public HealthProfile? HealthProfile { get; set; }
    public ICollection<Attendance> Attendances { get; set; } = [];

    public string FullName => $"{FirstName} {LastName}".Trim();

    public int Age => CalculateAge();

    private int CalculateAge()
    {
        var today = DateTime.UtcNow.Date;
        var age = today.Year - DateOfBirth.Year;
        if (DateOfBirth.Date > today.AddYears(-age)) age--;
        return age;
    }
}
