namespace Application.DTOS.Kitchen;

public class DailyOperationalSummaryDto
{
    public string Date { get; set; } = string.Empty;
    public int TotalAttendees { get; set; }
    public int TotalServingsPlanned { get; set; }
    public int TotalPreparations { get; set; }
    public List<PreparationSummaryItemDto> Preparations { get; set; } = [];
    public List<IngredientRequirementDto> IngredientRequirements { get; set; } = [];
}
