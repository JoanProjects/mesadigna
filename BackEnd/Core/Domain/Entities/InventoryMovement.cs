using Core.Domain.Common;
using Core.Domain.Enums;

namespace Core.Domain.Entities;

public class InventoryMovement : BaseEntity
{
    public int IngredientId { get; set; }
    public MovementType MovementType { get; set; }

    public decimal Quantity { get; set; }

    public DateOnly MovementDate { get; set; }

    public string? Reason { get; set; }

    // ── Navigation ──────────────────────────────────────────
    public Ingredient Ingredient { get; set; } = null!;
}
