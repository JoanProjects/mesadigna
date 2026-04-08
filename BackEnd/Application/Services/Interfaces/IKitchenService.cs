using Application.DTOS.Common;
using Application.DTOS.Ingredient;
using Application.DTOS.Kitchen;

namespace Application.Services.Interfaces;

public interface IKitchenService
{
    Task<DailyKitchenSummaryDto> GetDailySummaryAsync(DateOnly date, CancellationToken cancellationToken = default);

    Task<PagedResponseDto<DietCategoryBeneficiaryDto>> GetBeneficiariesByCategoryAsync(DateOnly date,
        string categoryKey, int page = 1, int pageSize = 50, CancellationToken cancellationToken = default);

    Task<DietarySummaryDto> GetDietarySummaryAsync(int page = 1, int pageSize = 10, DateOnly? startDate = null,
        DateOnly? endDate = null, string? search = null, CancellationToken cancellationToken = default);

    Task<IngredientsSummaryDto> GetIngredientsSummaryAsync(CancellationToken cancellationToken = default);

    Task<DailyOperationalSummaryDto> GetDailyOperationalSummaryAsync(DateOnly date,
        CancellationToken cancellationToken = default);
}