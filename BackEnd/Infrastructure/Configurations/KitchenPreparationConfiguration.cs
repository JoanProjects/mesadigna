using Core.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Configurations;

public class KitchenPreparationConfiguration : IEntityTypeConfiguration<KitchenPreparation>
{
    public void Configure(EntityTypeBuilder<KitchenPreparation> builder)
    {
        builder.ToTable("KitchenPreparations", "dbo");
        builder.HasKey(kp => kp.Id);
        builder.Property(kp => kp.Id).ValueGeneratedOnAdd();

        builder.Property(kp => kp.DailyKitchenPlanId).IsRequired();
        builder.Property(kp => kp.MealId).IsRequired();
        builder.Property(kp => kp.DietType).IsRequired();
        builder.Property(kp => kp.EstimatedServings).IsRequired();
        builder.Property(kp => kp.ActualServings);
        builder.Property(kp => kp.Status).IsRequired();
        builder.Property(kp => kp.Notes).HasMaxLength(500);

        builder.Property(kp => kp.CreatedAt).HasDefaultValueSql("GETUTCDATE()").IsRequired();
        builder.Property(kp => kp.IsActive).HasDefaultValue(true).IsRequired();

        builder.HasOne(kp => kp.DailyKitchenPlan)
            .WithMany(p => p.Preparations)
            .HasForeignKey(kp => kp.DailyKitchenPlanId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(kp => kp.Meal)
            .WithMany(m => m.KitchenPreparations)
            .HasForeignKey(kp => kp.MealId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
