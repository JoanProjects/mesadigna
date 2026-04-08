using Core.Domain.Entities;
using Core.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Configurations;

public class BeneficiaryConfiguration : IEntityTypeConfiguration<Beneficiary>
{
    public void Configure(EntityTypeBuilder<Beneficiary> builder)
    {
        builder.ToTable("Beneficiaries", "dbo");

        builder.HasKey(b => b.Id);

        builder.Property(b => b.Id)
            .HasColumnName("Id")
            .ValueGeneratedOnAdd();

        builder.Property(b => b.InternalCode)
            .HasColumnName("InternalCode")
            .HasMaxLength(20)
            .IsRequired();

        builder.Property(b => b.FirstName)
            .HasColumnName("FirstName")
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(b => b.LastName)
            .HasColumnName("LastName")
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(b => b.DateOfBirth)
            .HasColumnName("DateOfBirth")
            .IsRequired();

        builder.Property(b => b.Sex)
            .HasColumnName("Sex")
            .HasConversion<string>()
            .HasMaxLength(20)
            .IsRequired();

        builder.Property(b => b.Status)
            .HasColumnName("Status")
            .HasConversion<string>()
            .HasMaxLength(20)
            .IsRequired()
            .HasDefaultValue(BeneficiaryStatus.Activo);

        builder.Property(b => b.RegisteredAt)
            .HasColumnName("RegisteredAt")
            .HasDefaultValueSql("GETUTCDATE()")
            .IsRequired();

        builder.Property(b => b.IdentityDocument)
            .HasColumnName("IdentityDocument")
            .HasMaxLength(50);

        builder.Property(b => b.PhoneNumber)
            .HasColumnName("PhoneNumber")
            .HasMaxLength(20);

        builder.Property(b => b.Address)
            .HasColumnName("Address")
            .HasMaxLength(300);

        builder.Property(b => b.EmergencyContact)
            .HasColumnName("EmergencyContact")
            .HasMaxLength(200);

        builder.Property(b => b.Notes)
            .HasColumnName("Notes")
            .HasMaxLength(1000);

        builder.Property(b => b.CreatedAt)
            .HasColumnName("CreatedAt")
            .HasDefaultValueSql("GETUTCDATE()")
            .IsRequired();

        builder.Property(b => b.UpdatedAt)
            .HasColumnName("UpdatedAt");

        builder.Property(b => b.IsActive)
            .HasColumnName("IsActive")
            .HasDefaultValue(true)
            .IsRequired();

        builder.HasIndex(b => b.InternalCode)
            .IsUnique()
            .HasDatabaseName("IX_Beneficiaries_InternalCode");

        builder.HasIndex(b => b.IdentityDocument)
            .IsUnique()
            .HasFilter("[IdentityDocument] IS NOT NULL")
            .HasDatabaseName("IX_Beneficiaries_IdentityDocument");

        builder.HasIndex(b => b.Status)
            .HasDatabaseName("IX_Beneficiaries_Status");

        builder.HasIndex(b => b.IsActive)
            .HasDatabaseName("IX_Beneficiaries_IsActive");

        builder.HasIndex(b => new { b.LastName, b.FirstName })
            .HasDatabaseName("IX_Beneficiaries_Name");

        builder.Ignore(b => b.FullName);
        builder.Ignore(b => b.Age);

        // Relationships
        builder.HasOne(b => b.HealthProfile)
            .WithOne(hp => hp.Beneficiary)
            .HasForeignKey<HealthProfile>(hp => hp.BeneficiaryId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(b => b.Attendances)
            .WithOne(a => a.Beneficiary)
            .HasForeignKey(a => a.BeneficiaryId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasQueryFilter(b => b.IsActive);
    }
}
