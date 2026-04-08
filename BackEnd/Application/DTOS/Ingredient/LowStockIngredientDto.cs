namespace Application.DTOS.Ingredient;

public class LowStockIngredientDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal CurrentStock { get; set; }
    public decimal MinimumStock { get; set; }
    public string UnitOfMeasure { get; set; } = string.Empty;
}
