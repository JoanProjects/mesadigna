namespace Application.DTOS.Kitchen;

public class MealIngredientResponseDto
{
    public int Id { get; set; }
    public int IngredientId { get; set; }
    public string IngredientName { get; set; } = string.Empty;
    public decimal QuantityPerServing { get; set; }
    public string UnitOfMeasure { get; set; } = string.Empty;
}
