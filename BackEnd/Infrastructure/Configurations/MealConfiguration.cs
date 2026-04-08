using Core.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Configurations;

public class MealConfiguration : IEntityTypeConfiguration<Meal>
{
    public void Configure(EntityTypeBuilder<Meal> builder)
    {
        builder.ToTable("Meals", "dbo");
        builder.HasKey(m => m.Id);
        builder.Property(m => m.Id).ValueGeneratedOnAdd();

        builder.Property(m => m.Name).HasMaxLength(200).IsRequired();
        builder.Property(m => m.Description).HasMaxLength(500);
        builder.Property(m => m.MealType).IsRequired();
        builder.Property(m => m.BaseServings).HasDefaultValue(1).IsRequired();

        builder.Property(m => m.CreatedAt).HasDefaultValueSql("GETUTCDATE()").IsRequired();
        builder.Property(m => m.IsActive).HasDefaultValue(true).IsRequired();

        builder.HasIndex(m => m.Name).IsUnique().HasDatabaseName("IX_Meals_Name");
        builder.HasIndex(m => m.IsActive).HasDatabaseName("IX_Meals_IsActive");

        builder.HasQueryFilter(m => m.IsActive);
    }
}
