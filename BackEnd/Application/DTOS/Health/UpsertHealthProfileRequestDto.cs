using System.ComponentModel.DataAnnotations;
using Core.Domain.Enums;

namespace Application.DTOS.Health;

public class UpsertHealthProfileRequestDto
{
    [StringLength(1000)]
    public string? MedicalConditions { get; set; }

    [StringLength(500)]
    public string? DietaryRestrictions { get; set; }

    [StringLength(500)]
    public string? Allergies { get; set; }

    public bool HasHypertension { get; set; }
    public bool HasDiabetes { get; set; }

    public SpecialCondition SpecialConditions { get; set; } = SpecialCondition.Ninguna;

    [StringLength(1000)]
    public string? NutritionalNotes { get; set; }

    [StringLength(1000)]
    public string? AdditionalNotes { get; set; }
}
