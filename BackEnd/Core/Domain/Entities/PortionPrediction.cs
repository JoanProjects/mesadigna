using Core.Domain.Common;

namespace Core.Domain.Entities;

public class PortionPrediction : BaseEntity
{
    public DateOnly PredictionDate { get; set; }

    public int RecommendedPortions { get; set; }

    public int RegularPortions { get; set; }

    public int SpecialDietPortions { get; set; }

    public double ModelConfidence { get; set; }

    public string ModelName { get; set; } = string.Empty;

    public string ModelVersion { get; set; } = string.Empty;

    public DateTime GeneratedAt { get; set; }

    public string? DietaryDistributionJson { get; set; }

    public int? ActualAttendance { get; set; }

    public double? AccuracyScore { get; set; }

    public int? ActualPortionsPrepared { get; set; }

    public int? WastedPortions { get; set; }

    public string? EvaluationMetricsJson { get; set; }

    public string? FeatureImportancesJson { get; set; }

    // ── Navigation ──────────────────────────────────────────
    public PredictionInputSnapshot? InputSnapshot { get; set; }
}
