using System.Net.Http.Json;
using System.Text.Json;
using Application.DTOS.Prediction;
using Application.Services.Interfaces;
using Infrastructure.ExternalServices.Prediction.Dtos;
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

    public async Task<PortionPredictionResponseDto> GetPortionRecommendationAsync(
        GeneratePredictionRequestDto request,
        CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Enviando solicitud de predicción para fecha {Date}", request.TargetDate);

        var pythonRequest = new PythonPredictionRequestDto
        {
            TargetDate = request.TargetDate.ToString("yyyy-MM-dd")
        };

        var response = await _httpClient.PostAsJsonAsync(
            "/api/predict-portions", pythonRequest, JsonOptions, cancellationToken);
        response.EnsureSuccessStatusCode();

        var pythonResult = await response.Content
                               .ReadFromJsonAsync<PythonPredictionResponseDto>(JsonOptions, cancellationToken)
                           ?? throw new InvalidOperationException(
                               "El microservicio Python devolvió una respuesta vacía.");

        _logger.LogInformation("Predicción recibida: {Portions} porciones con confianza {Confidence}",
            pythonResult.RecommendedPortions, pythonResult.Confidence);

        return new PortionPredictionResponseDto
        {
            PredictionDate = pythonResult.TargetDate,
            RecommendedPortions = pythonResult.RecommendedPortions,
            RegularPortions = pythonResult.RegularPortions,
            SpecialDietPortions = pythonResult.SpecialDietPortions,
            ModelConfidence = pythonResult.Confidence,
            ModelName = pythonResult.Metadata.ModelName,
            ModelVersion = pythonResult.Metadata.ModelVersion,
            GeneratedAt = DateTime.TryParse(pythonResult.GeneratedAt, out var dt) ? dt : DateTime.UtcNow,
            DietaryBreakdown = pythonResult.DietaryBreakdown
        };
    }

    public async Task<ModelInfoResponseDto> GetModelInfoAsync(CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Consultando información del modelo");

        var response = await _httpClient.GetAsync("/api/model/info", cancellationToken);
        response.EnsureSuccessStatusCode();

        return await response.Content
                   .ReadFromJsonAsync<ModelInfoResponseDto>(JsonOptions, cancellationToken)
               ?? throw new InvalidOperationException("El microservicio devolvió respuesta vacía para model info.");
    }

    public async Task<RetrainResponseDto> RetrainModelAsync(
        RetrainRequestDto request,
        CancellationToken cancellationToken = default)
    {
       
        var pythonRequest = new PythonRetrainRequestDto
        {
            TrainingData = [] // el orquestador inyecta esto
        };

        _logger.LogInformation("Enviando solicitud de reentrenamiento desde {From} hasta {To}",
            request.FromDate, request.ToDate);

        var response = await _httpClient.PostAsJsonAsync(
            "/api/model/retrain", pythonRequest, JsonOptions, cancellationToken);
        response.EnsureSuccessStatusCode();

        var pythonResult = await response.Content
                               .ReadFromJsonAsync<PythonRetrainResponseDto>(JsonOptions, cancellationToken)
                           ?? throw new InvalidOperationException(
                               "El microservicio devolvió respuesta vacía para reentrenamiento.");

        _logger.LogInformation("Modelo reentrenado: versión {Version}, {Samples} muestras",
            pythonResult.ModelVersion, pythonResult.TrainingSamples);

        return new RetrainResponseDto
        {
            ModelVersion = pythonResult.ModelVersion,
            TrainingSamples = pythonResult.TrainingSamples,
            EvaluationMetrics = pythonResult.EvaluationMetrics,
            FeatureImportances = pythonResult.FeatureImportances,
            LastTrainedAt = pythonResult.LastTrainedAt
        };
    }
}