using System.Linq.Expressions;
using Core.Domain.Common;
using Core.Domain.Entities;

namespace Core.Domain.Interfaces.Repositories;

public interface IMealRepository : IBaseRepository<Meal>
{
    Task<Meal?> GetByIdWithIngredientsAsync(int id, CancellationToken cancellationToken = default);
    Task<PagedResult<Meal>> GetPagedWithIngredientsAsync(
        int page, int pageSize,
        Expression<Func<Meal, bool>>? filter = null,
        Expression<Func<Meal, object>>? orderBy = null,
        CancellationToken cancellationToken = default);
    Task<bool> ExistsByNameAsync(string name, int? excludeId = null, CancellationToken cancellationToken = default);
}
