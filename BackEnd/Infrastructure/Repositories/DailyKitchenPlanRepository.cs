

using Core.Domain.Entities;
using Core.Domain.Interfaces.Repositories;
using Infrastructure.Data;
using Infrastructure.Repositories;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories;

public class DailyKitchenPlanRepository : BaseRepository<DailyKitchenPlan>, IDailyKitchenPlanRepository
{
    public DailyKitchenPlanRepository(ApplicationDbContext context) : base(context) { }

    public async Task<DailyKitchenPlan?> GetByIdWithPreparationsAsync(int id, CancellationToken cancellationToken = default)
    {
        return await DbSet.AsNoTracking()
            .Include(p => p.Preparations)
            .ThenInclude(kp => kp.Meal)
            .FirstOrDefaultAsync(p => p.Id == id, cancellationToken);
    }

    public async Task<List<DailyKitchenPlan>> GetByDateAsync(DateOnly date, CancellationToken cancellationToken = default)
    {
        return await DbSet.AsNoTracking()
            .Where(p => p.PlanDate == date)
            .Include(p => p.Preparations)
            .ThenInclude(kp => kp.Meal)
            .OrderBy(p => p.MealType)
            .ToListAsync(cancellationToken);
    }

    public async Task<DailyKitchenPlan?> GetByDateWithPreparationsAsync(DateOnly date, CancellationToken cancellationToken = default)
    {
        return await DbSet.AsNoTracking()
            .Include(p => p.Preparations)
            .ThenInclude(kp => kp.Meal)
            .ThenInclude(m => m.MealIngredients)
            .ThenInclude(mi => mi.Ingredient)
            .FirstOrDefaultAsync(p => p.PlanDate == date, cancellationToken);
    }
}