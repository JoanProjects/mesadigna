using System.Linq.Expressions;
using Core.Domain.Common;
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

    public async Task<PagedResult<Meal>> GetPagedWithIngredientsAsync(
        int page, int pageSize,
        Expression<Func<Meal, bool>>? filter = null,
        Expression<Func<Meal, object>>? orderBy = null,
        CancellationToken cancellationToken = default)
    {
        var query = DbSet.AsNoTracking()
            .Include(m => m.MealIngredients)
            .IgnoreQueryFilters().AsQueryable();

        if (filter is not null)
            query = query.Where(filter);

        query = orderBy is not null
            ? query.OrderBy(orderBy)
            : query.OrderBy(e => e.Id);

        var totalCount = await query.CountAsync(cancellationToken);

        var items = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return PagedResult<Meal>.Create(items, page, pageSize, totalCount);
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