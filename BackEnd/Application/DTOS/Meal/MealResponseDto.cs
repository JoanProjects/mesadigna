namespace Application.DTOS.Kitchen;

public class MealResponseDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string MealType { get; set; } = string.Empty;
    public int BaseServings { get; set; }
    public DateTime CreatedAt { get; set; }
    public List<MealIngredientResponseDto> Ingredients { get; set; } = [];
}
