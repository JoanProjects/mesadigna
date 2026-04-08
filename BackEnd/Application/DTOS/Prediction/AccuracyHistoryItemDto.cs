namespace Application.DTOS.Prediction;

public class AccuracyHistoryItemDto
{
    public string PredictionDate { get; set; } = string.Empty;
    public int RecommendedPortions { get; set; }
    public int? ActualAttendance { get; set; }
    public int? ActualPortionsPrepared { get; set; }
    public double? AccuracyScore { get; set; }
    public string ModelVersion { get; set; } = string.Empty;
}
