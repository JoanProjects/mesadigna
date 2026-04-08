using Core.Domain.Entities;

namespace Infrastructure.Repositories;

public interface IDailyKitchenPlanRepository : IBaseRepository<DailyKitchenPlan>
{
    Task<DailyKitchenPlan?> GetByIdWithPreparationsAsync(int id, CancellationToken cancellationToken = default);
    Task<List<DailyKitchenPlan>> GetByDateAsync(DateOnly date, CancellationToken cancellationToken = default);
    Task<DailyKitchenPlan?> GetByDateWithPreparationsAsync(DateOnly date, CancellationToken cancellationToken = default);
}
