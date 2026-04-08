using Core.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Configurations;

public class PortionPredictionConfiguration : IEntityTypeConfiguration<PortionPrediction>
{
    public void Configure(EntityTypeBuilder<PortionPrediction> builder)
    {
        builder.ToTable("PortionPredictions", "dbo");

        builder.HasKey(e => e.Id);

        builder.Property(e => e.ModelName).HasMaxLength(100);
        builder.Property(e => e.ModelVersion).HasMaxLength(50);
        builder.Property(e => e.DietaryDistributionJson).HasMaxLength(2000);
        builder.Property(e => e.EvaluationMetricsJson).HasMaxLength(2000);
        builder.Property(e => e.FeatureImportancesJson).HasMaxLength(2000);

        builder.HasIndex(e => e.PredictionDate);
        builder.HasIndex(e => e.GeneratedAt);
        builder.HasIndex(e => e.IsActive);

        builder.HasOne(e => e.InputSnapshot)
            .WithOne(e => e.Prediction)
            .HasForeignKey<PredictionInputSnapshot>(e => e.PortionPredictionId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasQueryFilter(e => e.IsActive);
    }
}
