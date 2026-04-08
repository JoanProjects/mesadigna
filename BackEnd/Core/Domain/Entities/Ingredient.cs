using Core.Domain.Common;
using Core.Domain.Enums;

namespace Core.Domain.Entities;

public class Ingredient : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public UnitOfMeasure UnitOfMeasure { get; set; }

    public decimal StockQuantity { get; set; }

    public decimal MinimumStock { get; set; }

    public bool IsLowStock => StockQuantity <= MinimumStock;

    // ── Navigation ──────────────────────────────────────────
    public ICollection<MealIngredient> MealIngredients { get; set; } = [];
    public ICollection<InventoryMovement> InventoryMovements { get; set; } = [];
}
