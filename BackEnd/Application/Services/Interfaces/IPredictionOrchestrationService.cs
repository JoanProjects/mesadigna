using Application.DTOS.Prediction;

namespace Application.Services.Interfaces;

public interface IPredictionOrchestrationService
{
    Task<PortionPredictionResponseDto> GeneratePredictionAsync(DateOnly targetDate,
        CancellationToken cancellationToken = default);

    Task<List<PortionPredictionResponseDto>> GetByDateAsync(DateOnly date,
        CancellationToken cancellationToken = default);

    Task<PortionPredictionResponseDto?> GetLatestByDateAsync(DateOnly date,
        CancellationToken cancellationToken = default);
    
    Task UpdateActualAttendanceAsync(DateOnly date, int actualAttendance,
        CancellationToken cancellationToken = default);

    Task UpdateActualPortionsAsync(DateOnly date, int portionsPrepared, int? wasted,
        CancellationToken cancellationToken = default);

    Task<List<AccuracyHistoryItemDto>> GetAccuracyHistoryAsync(int days = 30,
        CancellationToken cancellationToken = default);

    Task<ModelInfoResponseDto> GetModelInfoAsync(CancellationToken cancellationToken = default);
    
    Task<RetrainResponseDto> TriggerRetrainAsync(DateOnly fromDate, DateOnly toDate,
        CancellationToken cancellationToken = default);
}