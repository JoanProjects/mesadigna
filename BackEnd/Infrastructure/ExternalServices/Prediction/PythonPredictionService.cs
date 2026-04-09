using System.Net.Http.Json;
using System.Text.Json;
using Application.DTOS.Prediction;
using Application.Services.Interfaces;
using Microsoft.Extensions.Logging;

namespace Infrastructure.ExternalServices.Prediction;

public class PythonPredictionService : IPredictionService
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<PythonPredictionService> _logger;

    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.SnakeCaseLower,
        PropertyNameCaseInsensitive = true
    };

    public PythonPredictionService(HttpClient httpClient, ILogger<PythonPredictionService> logger)
    {
        _httpClient = httpClient;
        _logger = logger;
    }

    public async Task<PythonPredictionResponseDto> GetPortionRecommendationAsync(
        PythonPredictionRequestDto request,
        CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Enviando solicitud de predicción para fecha {Date}", request.TargetDate);

        try
        {
            var response = await _httpClient.PostAsJsonAsync(
                "/api/predict-portions", request, JsonOptions, cancellationToken);
            response.EnsureSuccessStatusCode();

            return await response.Content
                       .ReadFromJsonAsync<PythonPredictionResponseDto>(JsonOptions, cancellationToken)
                   ?? throw new InvalidOperationException("El microservicio Python devolvió una respuesta vacía.");
        }
        catch (Exception ex) when (ex is HttpRequestException or TaskCanceledException or InvalidOperationException)
        {
            _logger.LogWarning(ex, "Microservicio Python no disponible, usando fallback heurístico");
            return BuildFallbackPrediction(request);
        }
    }

    private static PythonPredictionResponseDto BuildFallbackPrediction(PythonPredictionRequestDto request)
    {
        var targetDate = DateOnly.Parse(request.TargetDate);
        double baseEstimate = request.AttendanceLast7DaysAvg > 0
            ? request.AttendanceLast7DaysAvg
            : request.AttendanceLast30DaysAvg > 0
                ? request.AttendanceLast30DaysAvg
                : request.TotalActiveBeneficiaries * 0.65;

        if (targetDate.DayOfWeek is DayOfWeek.Saturday or DayOfWeek.Sunday)
            baseEstimate *= 0.70;

        int recommended = (int)Math.Ceiling(baseEstimate * 1.10);
        int total = Math.Max(request.TotalActiveBeneficiaries, 1);
        var d = request.DietaryDistribution;

        int hyp = Proportional(d.HypertensionCount, total, baseEstimate);
        int diab = Proportional(d.DiabetesCount, total, baseEstimate);
        int allerg = Proportional(d.AllergiesCount, total, baseEstimate);
        int spec = Proportional(d.DietaryRestrictionsCount, total, baseEstimate);
        int totalSpecial = hyp + diab + allerg + spec;
        int regular = Math.Max(recommended - totalSpecial, 0);

        return new PythonPredictionResponseDto
        {
            TargetDate = request.TargetDate,
            RecommendedPortions = recommended,
            RegularPortions = regular,
            SpecialDietPortions = totalSpecial,
            Confidence = 0.5,
            DietaryBreakdown = new DietaryBreakdownDto
            {
                Regular = regular, Hypertension = hyp,
                Diabetes = diab, Allergies = allerg, SpecialDiet = spec
            },
            Metadata = new PredictionMetadataDto
            {
                ModelName = "HeuristicFallback",
                ModelVersion = "fallback-1.0",
                FeaturesUsed = ["attendance_avg", "day_of_week", "dietary_distribution"],
                TrainingSamples = 0,
                FeatureImportances = new Dictionary<string, double>()
            },
            GeneratedAt = DateTime.UtcNow.ToString("o"),
            EvaluationMetrics = null
        };
    }

    private static int Proportional(int count, int total, double predicted)
    {
        if (count <= 0) return 0;
        return Math.Max((int)Math.Ceiling(predicted * count / (double)total), 1);
    }

    public async Task<ModelInfoResponseDto> GetModelInfoAsync(CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Consultando información del modelo");

        try
        {
            var response = await _httpClient.GetAsync("/api/model/info", cancellationToken);
            response.EnsureSuccessStatusCode();

            return await response.Content
                       .ReadFromJsonAsync<ModelInfoResponseDto>(JsonOptions, cancellationToken)
                   ?? throw new InvalidOperationException("El microservicio devolvió respuesta vacía para model info.");
        }
        catch (HttpRequestException ex)
        {
            _logger.LogError(ex, "Error consultando info del modelo");
            throw new InvalidOperationException(
                "No se pudo contactar el microservicio de predicción.", ex);
        }
        catch (TaskCanceledException ex) when (ex.InnerException is TimeoutException)
        {
            _logger.LogError(ex, "Timeout consultando info del modelo");
            throw new InvalidOperationException(
                "El microservicio de predicción no respondió a tiempo.", ex);
        }
    }

    public async Task<PythonRetrainResponseDto> RetrainModelAsync(
        PythonRetrainRequestDto request,
        CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Enviando {Count} puntos de datos para reentrenamiento",
            request.TrainingData.Count);

        try
        {
            var response = await _httpClient.PostAsJsonAsync(
                "/api/model/retrain", request, JsonOptions, cancellationToken);
            response.EnsureSuccessStatusCode();

            return await response.Content
                       .ReadFromJsonAsync<PythonRetrainResponseDto>(JsonOptions, cancellationToken)
                   ?? throw new InvalidOperationException(
                       "El microservicio devolvió respuesta vacía para reentrenamiento.");
        }
        catch (HttpRequestException ex)
        {
            _logger.LogError(ex, "Error durante reentrenamiento del modelo");
            throw new InvalidOperationException(
                "No se pudo contactar el microservicio de predicción para reentrenamiento.", ex);
        }
        catch (TaskCanceledException ex) when (ex.InnerException is TimeoutException)
        {
            _logger.LogError(ex, "Timeout durante reentrenamiento del modelo");
            throw new InvalidOperationException(
                "El microservicio de predicción no respondió a tiempo durante reentrenamiento.", ex);
        }
    }
}