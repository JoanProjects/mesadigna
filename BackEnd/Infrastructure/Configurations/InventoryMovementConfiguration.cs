using Core.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Configurations;

public class InventoryMovementConfiguration : IEntityTypeConfiguration<InventoryMovement>
{
    public void Configure(EntityTypeBuilder<InventoryMovement> builder)
    {
        builder.ToTable("InventoryMovements", "dbo");
        builder.HasKey(im => im.Id);
        builder.Property(im => im.Id).ValueGeneratedOnAdd();

        builder.Property(im => im.IngredientId).IsRequired();
        builder.Property(im => im.MovementType).IsRequired();
        builder.Property(im => im.Quantity).HasPrecision(18, 4).IsRequired();
        builder.Property(im => im.MovementDate).IsRequired();
        builder.Property(im => im.Reason).HasMaxLength(500);

        builder.Property(im => im.CreatedAt).HasDefaultValueSql("GETUTCDATE()").IsRequired();
        builder.Property(im => im.IsActive).HasDefaultValue(true).IsRequired();

        builder.HasIndex(im => im.MovementDate)
            .HasDatabaseName("IX_InventoryMovements_MovementDate");

        builder.HasIndex(im => im.IngredientId)
            .HasDatabaseName("IX_InventoryMovements_IngredientId");

        builder.HasOne(im => im.Ingredient)
            .WithMany(i => i.InventoryMovements)
            .HasForeignKey(im => im.IngredientId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
