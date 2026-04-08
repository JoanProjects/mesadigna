using Core.Domain.Entities;
using Core.Domain.Interfaces.Repositories;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories;

public class MealRepository : BaseRepository<Meal>, IMealRepository
{
    public MealRepository(ApplicationDbContext context) : base(context)
    {
    }

    public async Task<Meal?> GetByIdWithIngredientsAsync(int id, CancellationToken cancellationToken = default)
    {
        return await DbSet.AsNoTracking()
            .Include(m => m.MealIngredients)
            .ThenInclude(mi => mi.Ingredient)
            .FirstOrDefaultAsync(m => m.Id == id, cancellationToken);
    }

    public async Task<bool> ExistsByNameAsync(string name, int? excludeId = null,
        CancellationToken cancellationToken = default)
    {
        var query = DbSet.Where(m => m.Name.ToLower() == name.ToLower());
        if (excludeId.HasValue)
            query = query.Where(m => m.Id != excludeId.Value);
        return await query.AnyAsync(cancellationToken);
    }
}