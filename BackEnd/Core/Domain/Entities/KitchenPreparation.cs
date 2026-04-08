using Core.Domain.Common;
using Core.Domain.Enums;

namespace Core.Domain.Entities;

public class KitchenPreparation : BaseEntity
{
    public int DailyKitchenPlanId { get; set; }
    public int MealId { get; set; }
    public DietType DietType { get; set; } = DietType.Normal;

    public int EstimatedServings { get; set; }

    public int? ActualServings { get; set; }

    public PreparationStatus Status { get; set; } = PreparationStatus.Planificada;
    public string? Notes { get; set; }

    // ── Navigation ──────────────────────────────────────────
    public DailyKitchenPlan DailyKitchenPlan { get; set; } = null!;
    public Meal Meal { get; set; } = null!;
}
