using Core.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Configurations;

public class MealIngredientConfiguration : IEntityTypeConfiguration<MealIngredient>
{
    public void Configure(EntityTypeBuilder<MealIngredient> builder)
    {
        builder.ToTable("MealIngredients", "dbo");
        builder.HasKey(mi => mi.Id);
        builder.Property(mi => mi.Id).ValueGeneratedOnAdd();

        builder.Property(mi => mi.MealId).IsRequired();
        builder.Property(mi => mi.IngredientId).IsRequired();
        builder.Property(mi => mi.QuantityPerServing).HasPrecision(18, 4).IsRequired();
        builder.Property(mi => mi.UnitOfMeasure).IsRequired();

        builder.Property(mi => mi.CreatedAt).HasDefaultValueSql("GETUTCDATE()").IsRequired();
        builder.Property(mi => mi.IsActive).HasDefaultValue(true).IsRequired();

        builder.HasIndex(mi => new { mi.MealId, mi.IngredientId })
            .IsUnique()
            .HasDatabaseName("IX_MealIngredients_Meal_Ingredient");

        builder.HasOne(mi => mi.Meal)
            .WithMany(m => m.MealIngredients)
            .HasForeignKey(mi => mi.MealId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(mi => mi.Ingredient)
            .WithMany(i => i.MealIngredients)
            .HasForeignKey(mi => mi.IngredientId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
