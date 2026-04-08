using Core.Domain.Common;
using Core.Domain.Enums;

namespace Core.Domain.Entities;

public class Meal : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public MealType MealType { get; set; }

    public int BaseServings { get; set; }

    // ── Navigation ──────────────────────────────────────────
    public ICollection<MealIngredient> MealIngredients { get; set; } = [];
    public ICollection<KitchenPreparation> KitchenPreparations { get; set; } = [];
}
