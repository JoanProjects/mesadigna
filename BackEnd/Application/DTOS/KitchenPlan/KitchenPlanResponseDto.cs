using Application.DTOS.Kitchen;

namespace Application.DTOS.KitchenPlan;

public class KitchenPlanResponseDto
{
    public int Id { get; set; }
    public string PlanDate { get; set; } = string.Empty;
    public string MealType { get; set; } = string.Empty;
    public int EstimatedBeneficiaries { get; set; }
    public int EstimatedServings { get; set; }
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; }
    public List<KitchenPreparationResponseDto> Preparations { get; set; } = [];
}