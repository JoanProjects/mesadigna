using System.ComponentModel.DataAnnotations;
using Core.Domain.Enums;

namespace Application.DTOS.Kitchen;

public class CreateKitchenPlanRequestDto
{
    [Required]
    public DateOnly PlanDate { get; set; }

    [Required]
    public MealType MealType { get; set; } = MealType.Almuerzo;

    [Range(0, int.MaxValue)]
    public int EstimatedBeneficiaries { get; set; }

    [Range(0, int.MaxValue)]
    public int EstimatedServings { get; set; }

    [MaxLength(1000)]
    public string? Notes { get; set; }
}
