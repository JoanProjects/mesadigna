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
        catch (HttpRequestException ex)
        {
            _logger.LogError(ex, "Error al comunicarse con el microservicio de predicción");
            throw new InvalidOperationException(
                "No se pudo contactar el microservicio de predicción. Verifique que esté ejecutándose.", ex);
        }
        catch (TaskCanceledException ex) when (ex.InnerException is TimeoutException)
        {
            _logger.LogError(ex, "Timeout al comunicarse con el microservicio de predicción");
            throw new InvalidOperationException(
                "El microservicio de predicción no respondió a tiempo.", ex);
        }
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