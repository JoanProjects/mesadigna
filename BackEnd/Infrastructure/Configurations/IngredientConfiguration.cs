using Core.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Configurations;

public class IngredientConfiguration : IEntityTypeConfiguration<Ingredient>
{
    public void Configure(EntityTypeBuilder<Ingredient> builder)
    {
        builder.ToTable("Ingredients", "dbo");
        builder.HasKey(i => i.Id);
        builder.Property(i => i.Id).ValueGeneratedOnAdd();

        builder.Property(i => i.Name).HasMaxLength(150).IsRequired();
        builder.Property(i => i.Description).HasMaxLength(500);
        builder.Property(i => i.UnitOfMeasure).IsRequired();
        builder.Property(i => i.StockQuantity).HasPrecision(18, 4).HasDefaultValue(0m);
        builder.Property(i => i.MinimumStock).HasPrecision(18, 4).HasDefaultValue(0m);

        builder.Property(i => i.CreatedAt).HasDefaultValueSql("GETUTCDATE()").IsRequired();
        builder.Property(i => i.IsActive).HasDefaultValue(true).IsRequired();

        builder.HasIndex(i => i.Name).IsUnique().HasDatabaseName("IX_Ingredients_Name");
        builder.HasIndex(i => i.IsActive).HasDatabaseName("IX_Ingredients_IsActive");

        builder.HasQueryFilter(i => i.IsActive);
    }
}
