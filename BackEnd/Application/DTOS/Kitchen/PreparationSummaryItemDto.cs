namespace Application.DTOS.Kitchen;

public class PreparationSummaryItemDto
{
    public string MealName { get; set; } = string.Empty;
    public string DietType { get; set; } = string.Empty;
    public int EstimatedServings { get; set; }
    public string Status { get; set; } = string.Empty;
}
