using Core.Domain.Common;
using Core.Domain.Enums;

namespace Core.Domain.Entities;

public class HealthProfile : BaseEntity
{
    public int BeneficiaryId { get; set; }

    public string? MedicalConditions { get; set; }

    public string? DietaryRestrictions { get; set; }

    public string? Allergies { get; set; }

    public bool HasHypertension { get; set; }
    public bool HasDiabetes { get; set; }

    public SpecialCondition SpecialConditions { get; set; } = SpecialCondition.Ninguna;

    public string? NutritionalNotes { get; set; }

    public string? AdditionalNotes { get; set; }

    // ── Navigation ──────────────────────────────────────────
    public Beneficiary Beneficiary { get; set; } = null!;

    public bool HasDietaryConsiderations =>
        !string.IsNullOrWhiteSpace(DietaryRestrictions) ||
        !string.IsNullOrWhiteSpace(Allergies) ||
        HasHypertension ||
        HasDiabetes ||
        SpecialConditions != SpecialCondition.Ninguna;
}
