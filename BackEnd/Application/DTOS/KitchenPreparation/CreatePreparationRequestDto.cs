using System.ComponentModel.DataAnnotations;
using Core.Domain.Enums;

namespace Application.DTOS.Kitchen;

public class CreatePreparationRequestDto
{
    [Required]
    public int DailyKitchenPlanId { get; set; }

    [Required]
    public int MealId { get; set; }

    public DietType DietType { get; set; } = DietType.Normal;

    [Required]
    [Range(1, int.MaxValue, ErrorMessage = "Las raciones estimadas deben ser al menos 1.")]
    public int EstimatedServings { get; set; }

    [MaxLength(500)]
    public string? Notes { get; set; }
}
