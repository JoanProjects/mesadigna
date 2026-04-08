namespace Application.DTOS.Kitchen;

public class IngredientRequirementDto
{
    public int IngredientId { get; set; }
    public string IngredientName { get; set; } = string.Empty;
    public decimal TotalQuantityRequired { get; set; }
    public string UnitOfMeasure { get; set; } = string.Empty;
    public decimal CurrentStock { get; set; }
    public bool IsSufficient { get; set; }
}
