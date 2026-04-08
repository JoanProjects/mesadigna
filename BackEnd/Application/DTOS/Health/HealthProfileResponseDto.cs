namespace Application.DTOS.Health;

public class HealthProfileResponseDto
{
    public int Id { get; set; }
    public int BeneficiaryId { get; set; }
    public string? MedicalConditions { get; set; }
    public string? DietaryRestrictions { get; set; }
    public string? Allergies { get; set; }
    public bool HasHypertension { get; set; }
    public bool HasDiabetes { get; set; }
    public string SpecialConditions { get; set; } = string.Empty;
    public string? NutritionalNotes { get; set; }
    public string? AdditionalNotes { get; set; }
    public bool HasDietaryConsiderations { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}
