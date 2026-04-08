using Core.Domain.Entities;

namespace Core.Domain.Interfaces.Repositories;

public interface IMealRepository : IBaseRepository<Meal>
{
    Task<Meal?> GetByIdWithIngredientsAsync(int id, CancellationToken cancellationToken = default);
    Task<bool> ExistsByNameAsync(string name, int? excludeId = null, CancellationToken cancellationToken = default);
}
