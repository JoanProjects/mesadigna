using Core.Domain.Entities;
using Core.Domain.Interfaces.Repositories;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories;

public class IngredientRepository : BaseRepository<Ingredient>, IIngredientRepository
{
    public IngredientRepository(ApplicationDbContext context) : base(context)
    {
    }

    public async Task<bool> ExistsByNameAsync(string name, int? excludeId = null,
        CancellationToken cancellationToken = default)
    {
        var query = DbSet.Where(i => i.Name.ToLower() == name.ToLower());
        if (excludeId.HasValue)
            query = query.Where(i => i.Id != excludeId.Value);
        return await query.AnyAsync(cancellationToken);
    }

    public async Task<List<Ingredient>> GetLowStockAsync(CancellationToken cancellationToken = default)
    {
        return await DbSet.AsNoTracking()
            .Where(i => i.StockQuantity <= i.MinimumStock)
            .OrderBy(i => i.Name)
            .ToListAsync(cancellationToken);
    }

    public async Task<bool> IsUsedByAnyMealAsync(int ingredientId, CancellationToken cancellationToken = default)
    {
        return await Context.MealIngredients
            .AsNoTracking()
            .AnyAsync(mi => mi.IngredientId == ingredientId, cancellationToken);
    }
}