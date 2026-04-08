namespace Application.DTOS.Beneficiary;

public class BeneficiaryResponseDto
{
    public int Id { get; set; }
    public string InternalCode { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public DateTime DateOfBirth { get; set; }
    public int Age { get; set; }
    public string Sex { get; set; } = string.Empty;
    public string? IdentityDocument { get; set; }
    public string? PhoneNumber { get; set; }
    public string? Address { get; set; }
    public string? EmergencyContact { get; set; }
    public string Status { get; set; } = string.Empty;
    public string? Notes { get; set; }
    public DateTime RegisteredAt { get; set; }
    public DateTime CreatedAt { get; set; }
}