namespace Application.DTOS.Kitchen;

public class DailyKitchenSummaryDto
{
    public string Date { get; set; } = string.Empty;
    public int TotalServings { get; set; }
    public int RegularServings { get; set; }
    public int SpecialDietServings { get; set; }
    public List<DietCategoryCountDto> DietCategories { get; set; } = [];
}
