namespace Application.DTOS.Kitchen;

public class DietCategoryCountDto
{
    public string Category { get; set; } = string.Empty;
    public string CategoryKey { get; set; } = string.Empty;
    public int Count { get; set; }
}
