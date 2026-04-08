using Core.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Configurations;

public class PredictionInputSnapshotConfiguration : IEntityTypeConfiguration<PredictionInputSnapshot>
{
    public void Configure(EntityTypeBuilder<PredictionInputSnapshot> builder)
    {
        builder.ToTable("PredictionInputSnapshots", "dbo");

        builder.HasKey(e => e.Id);

        builder.HasIndex(e => e.PortionPredictionId).IsUnique();

        builder.Property(e => e.RawInputJson).HasMaxLength(4000);
    }
}
