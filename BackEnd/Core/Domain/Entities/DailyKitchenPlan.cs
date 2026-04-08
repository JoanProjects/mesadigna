using Core.Domain.Common;
using Core.Domain.Enums;

namespace Core.Domain.Entities;

public class DailyKitchenPlan : BaseEntity
{
    public DateOnly PlanDate { get; set; }

    public MealType MealType { get; set; } = MealType.Almuerzo;

    public int EstimatedBeneficiaries { get; set; }

    public int EstimatedServings { get; set; }

    public string? Notes { get; set; }

    // ── Navigation ──────────────────────────────────────────
    public ICollection<KitchenPreparation> Preparations { get; set; } = [];
}
