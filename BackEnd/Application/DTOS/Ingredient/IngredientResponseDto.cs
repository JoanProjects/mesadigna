namespace Application.DTOS.Ingredient;

public class IngredientResponseDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string UnitOfMeasure { get; set; } = string.Empty;
    public decimal StockQuantity { get; set; }
    public decimal MinimumStock { get; set; }
    public bool IsLowStock { get; set; }
    public DateTime CreatedAt { get; set; }
    
    public bool IsActive { get; set; }
    
}
