using Core.Domain.Entities;

namespace Core.Domain.Interfaces.Repositories;

public interface IIngredientRepository : IBaseRepository<Ingredient>
{
    Task<bool> ExistsByNameAsync(string name, int? excludeId = null, CancellationToken cancellationToken = default);
    Task<List<Ingredient>> GetLowStockAsync(CancellationToken cancellationToken = default);
}
