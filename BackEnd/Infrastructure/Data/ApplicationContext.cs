
using Core.Domain.Common;
using Core.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<Beneficiary> Beneficiaries => Set<Beneficiary>();
    public DbSet<HealthProfile> HealthProfiles => Set<HealthProfile>();
    public DbSet<Attendance> Attendances => Set<Attendance>();
    public DbSet<Ingredient> Ingredients => Set<Ingredient>();
    public DbSet<Meal> Meals => Set<Meal>();
    public DbSet<MealIngredient> MealIngredients => Set<MealIngredient>();
    public DbSet<DailyKitchenPlan> DailyKitchenPlans => Set<DailyKitchenPlan>();
    public DbSet<KitchenPreparation> KitchenPreparations => Set<KitchenPreparation>();
    public DbSet<InventoryMovement> InventoryMovements => Set<InventoryMovement>();
    public DbSet<PortionPrediction> PortionPredictions => Set<PortionPrediction>();
    public DbSet<PredictionInputSnapshot> PredictionInputSnapshots => Set<PredictionInputSnapshot>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(ApplicationDbContext).Assembly);
    }
    
    public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        foreach (var entry in ChangeTracker.Entries<BaseEntity>())
        {
            switch (entry.State)
            {
                
                case EntityState.Added:
                    entry.Entity.CreatedAt = DateTime.UtcNow;
                    break;
                case EntityState.Modified:
                    entry.Entity.UpdatedAt = DateTime.UtcNow;
                    break;
            }
        }

        return await base.SaveChangesAsync(cancellationToken);
    }
}
