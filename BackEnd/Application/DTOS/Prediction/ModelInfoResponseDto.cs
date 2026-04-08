namespace Application.DTOS.Prediction;

public class ModelInfoResponseDto
{
    public string ModelName { get; set; } = string.Empty;
    public string ModelVersion { get; set; } = string.Empty;
    public int TrainingSamples { get; set; }
    public List<string> FeaturesUsed { get; set; } = [];
    public Dictionary<string, double> FeatureImportances { get; set; } = new();
    public EvaluationMetricsDto? EvaluationMetrics { get; set; }
    public string? LastTrainedAt { get; set; }
}
