using Core.Domain.Entities;
using Core.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Configurations;

public class HealthProfileConfiguration : IEntityTypeConfiguration<HealthProfile>
{
    public void Configure(EntityTypeBuilder<HealthProfile> builder)
    {
        builder.ToTable("HealthProfiles", "dbo");

        builder.HasKey(hp => hp.Id);

        builder.Property(hp => hp.Id)
            .HasColumnName("Id")
            .ValueGeneratedOnAdd();

        builder.Property(hp => hp.BeneficiaryId)
            .HasColumnName("BeneficiaryId")
            .IsRequired();

        builder.Property(hp => hp.MedicalConditions)
            .HasColumnName("MedicalConditions")
            .HasMaxLength(1000);

        builder.Property(hp => hp.DietaryRestrictions)
            .HasColumnName("DietaryRestrictions")
            .HasMaxLength(500);

        builder.Property(hp => hp.Allergies)
            .HasColumnName("Allergies")
            .HasMaxLength(500);

        builder.Property(hp => hp.HasHypertension)
            .HasColumnName("HasHypertension")
            .HasDefaultValue(false)
            .IsRequired();

        builder.Property(hp => hp.HasDiabetes)
            .HasColumnName("HasDiabetes")
            .HasDefaultValue(false)
            .IsRequired();

        builder.Property(hp => hp.SpecialConditions)
            .HasColumnName("SpecialConditions")
            .HasConversion<int>()
            .HasDefaultValue(SpecialCondition.Ninguna)
            .IsRequired();

        builder.Property(hp => hp.NutritionalNotes)
            .HasColumnName("NutritionalNotes")
            .HasMaxLength(1000);

        builder.Property(hp => hp.AdditionalNotes)
            .HasColumnName("AdditionalNotes")
            .HasMaxLength(1000);

        builder.Property(hp => hp.CreatedAt)
            .HasColumnName("CreatedAt")
            .HasDefaultValueSql("GETUTCDATE()")
            .IsRequired();

        builder.Property(hp => hp.UpdatedAt)
            .HasColumnName("UpdatedAt");

        builder.Property(hp => hp.IsActive)
            .HasColumnName("IsActive")
            .HasDefaultValue(true)
            .IsRequired();

        builder.HasIndex(hp => hp.BeneficiaryId)
            .IsUnique()
            .HasDatabaseName("IX_HealthProfiles_BeneficiaryId");

        builder.Ignore(hp => hp.HasDietaryConsiderations);
    }
}
