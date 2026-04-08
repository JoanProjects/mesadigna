namespace Application.DTOS.Kitchen;

public class KitchenPreparationResponseDto
{
    public int Id { get; set; }
    public int MealId { get; set; }
    public string MealName { get; set; } = string.Empty;
    public string DietType { get; set; } = string.Empty;
    public int EstimatedServings { get; set; }
    public int? ActualServings { get; set; }
    public string Status { get; set; } = string.Empty;
    public string? Notes { get; set; }
}
