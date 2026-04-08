namespace Application.DTOS.Prediction;

public class PythonRetrainResponseDto
{
    public string ModelVersion { get; set; } = string.Empty;
    public int TrainingSamples { get; set; }
    public EvaluationMetricsDto EvaluationMetrics { get; set; } = new();
    public Dictionary<string, double> FeatureImportances { get; set; } = new();
    public string LastTrainedAt { get; set; } = string.Empty;
}
