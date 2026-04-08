namespace Application.DTOS.Kitchen;

public class DietaryBeneficiaryDto
{
    public int BeneficiaryId { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string InternalCode { get; set; } = string.Empty;
    public string? DietaryRestrictions { get; set; }
    public string? Allergies { get; set; }
    public bool HasHypertension { get; set; }
    public bool HasDiabetes { get; set; }
    public string SpecialConditions { get; set; } = string.Empty;
}
