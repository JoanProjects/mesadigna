using Application.DTOS.Prediction;

namespace Application.Services.Interfaces;

public interface IPredictionService
{
    Task<PortionPredictionResponseDto> GetPortionRecommendationAsync(
        GeneratePredictionRequestDto request,
        CancellationToken cancellationToken = default);

    Task<ModelInfoResponseDto> GetModelInfoAsync(
        CancellationToken cancellationToken = default);

    Task<RetrainResponseDto> RetrainModelAsync(
        RetrainRequestDto request,
        CancellationToken cancellationToken = default);
}