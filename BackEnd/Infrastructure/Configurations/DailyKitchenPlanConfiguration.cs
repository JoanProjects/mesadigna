using Core.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Configurations;

public class DailyKitchenPlanConfiguration : IEntityTypeConfiguration<DailyKitchenPlan>
{
    public void Configure(EntityTypeBuilder<DailyKitchenPlan> builder)
    {
        builder.ToTable("DailyKitchenPlans", "dbo");
        builder.HasKey(p => p.Id);
        builder.Property(p => p.Id).ValueGeneratedOnAdd();

        builder.Property(p => p.PlanDate).IsRequired();
        builder.Property(p => p.MealType).IsRequired();
        builder.Property(p => p.EstimatedBeneficiaries).HasDefaultValue(0).IsRequired();
        builder.Property(p => p.EstimatedServings).HasDefaultValue(0).IsRequired();
        builder.Property(p => p.Notes).HasMaxLength(1000);

        builder.Property(p => p.CreatedAt).HasDefaultValueSql("GETUTCDATE()").IsRequired();
        builder.Property(p => p.IsActive).HasDefaultValue(true).IsRequired();

        builder.HasIndex(p => new { p.PlanDate, p.MealType })
            .IsUnique()
            .HasDatabaseName("IX_DailyKitchenPlans_Date_MealType");

        builder.HasIndex(p => p.PlanDate)
            .HasDatabaseName("IX_DailyKitchenPlans_PlanDate");
    }
}
