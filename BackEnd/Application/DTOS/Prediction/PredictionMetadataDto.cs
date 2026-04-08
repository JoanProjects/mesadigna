namespace Application.DTOS.Prediction;

public class PredictionMetadataDto
{
    public string ModelName { get; set; } = string.Empty;
    public string ModelVersion { get; set; } = string.Empty;
    public List<string> FeaturesUsed { get; set; } = [];
    public int TrainingSamples { get; set; }
    public Dictionary<string, double> FeatureImportances { get; set; } = new();
}
