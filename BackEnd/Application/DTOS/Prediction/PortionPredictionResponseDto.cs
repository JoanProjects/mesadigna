namespace Application.DTOS.Prediction;

public class PortionPredictionResponseDto
{
    public int Id { get; set; }
    public string PredictionDate { get; set; } = string.Empty;
    public int RecommendedPortions { get; set; }
    public int RegularPortions { get; set; }
    public int SpecialDietPortions { get; set; }
    public double ModelConfidence { get; set; }
    public string ModelName { get; set; } = string.Empty;
    public string ModelVersion { get; set; } = string.Empty;
    public DateTime GeneratedAt { get; set; }
    public DietaryBreakdownDto? DietaryBreakdown { get; set; }
    public int? ActualAttendance { get; set; }
    public double? AccuracyScore { get; set; }
    public int? ActualPortionsPrepared { get; set; }
    public int? WastedPortions { get; set; }
    public PredictionInputSnapshotDto? InputSnapshot { get; set; }
}
