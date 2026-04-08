using Application.DTOS.Prediction;

namespace Infrastructure.ExternalServices.Prediction.Dtos;

public class PythonPredictionResponseDto
{
    public string TargetDate { get; set; } = string.Empty;
    public int RecommendedPortions { get; set; }
    public int RegularPortions { get; set; }
    public int SpecialDietPortions { get; set; }
    public double Confidence { get; set; }
    public DietaryBreakdownDto DietaryBreakdown { get; set; } = new();
    public PredictionMetadataDto Metadata { get; set; } = new();
    public string GeneratedAt { get; set; } = string.Empty;
    public EvaluationMetricsDto? EvaluationMetrics { get; set; }
}
