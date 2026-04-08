using Application.DTOS.Prediction;

namespace Application.Services.Interfaces;

public interface IPredictionService
{
    Task<PythonPredictionResponseDto> GetPortionRecommendationAsync(
        PythonPredictionRequestDto request,
        CancellationToken cancellationToken = default);

    Task<ModelInfoResponseDto> GetModelInfoAsync(
        CancellationToken cancellationToken = default);

    Task<PythonRetrainResponseDto> RetrainModelAsync(
        PythonRetrainRequestDto request,
        CancellationToken cancellationToken = default);
}