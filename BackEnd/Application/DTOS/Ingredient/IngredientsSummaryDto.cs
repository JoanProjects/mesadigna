namespace Application.DTOS.Ingredient;

public class IngredientsSummaryDto
{
    public int TotalIngredients { get; set; }
    public int LowStockCount { get; set; }
    public List<LowStockIngredientDto> LowStockItems { get; set; } = [];
}
