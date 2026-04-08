using Core.Domain.Entities;

namespace Infrastructure.Repositories;

public interface IHealthProfileRepository : IBaseRepository<HealthProfile>
{
    Task<HealthProfile?> GetByBeneficiaryIdAsync(int beneficiaryId, CancellationToken cancellationToken = default);
    Task<HealthProfile?> GetByBeneficiaryIdTrackedAsync(int beneficiaryId, CancellationToken cancellationToken = default);
    Task<List<HealthProfile>> GetProfilesWithDietaryConsiderationsAsync(CancellationToken cancellationToken = default);
    Task<(List<HealthProfile> Items, int TotalCount)> GetProfilesWithDietaryConsiderationsPagedAsync(
        int page, int pageSize, DateOnly? startDate, DateOnly? endDate, string? search,
        CancellationToken cancellationToken = default);
}
