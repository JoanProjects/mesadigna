using Core.Domain.Common;
using Core.Domain.Enums;

namespace Core.Domain.Entities;

public class MealIngredient : BaseEntity
{
    public int MealId { get; set; }
    public int IngredientId { get; set; }

    public decimal QuantityPerServing { get; set; }

    public UnitOfMeasure UnitOfMeasure { get; set; }

    // ── Navigation ──────────────────────────────────────────
    public Meal Meal { get; set; } = null!;
    public Ingredient Ingredient { get; set; } = null!;
}
