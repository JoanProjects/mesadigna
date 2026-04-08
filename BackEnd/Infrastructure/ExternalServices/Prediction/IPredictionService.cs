using Application.DTOS.Prediction;

namespace Infrastructure.ExternalServices.Prediction;

public interface IPredictionService
{
    Task<PythonPredictionResponseDto> GetPortionRecommendationAsync(PythonPredictionRequestDto request,
        CancellationToken cancellationToken = default);

    Task<ModelInfoResponseDto> GetModelInfoAsync(CancellationToken cancellationToken = default);

    Task<PythonRetrainResponseDto> RetrainModelAsync(PythonRetrainRequestDto request,
        CancellationToken cancellationToken = default);
}