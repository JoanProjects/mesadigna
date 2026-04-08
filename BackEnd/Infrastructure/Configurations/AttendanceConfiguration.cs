using Core.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Configurations;

public class AttendanceConfiguration : IEntityTypeConfiguration<Attendance>
{
    public void Configure(EntityTypeBuilder<Attendance> builder)
    {
        builder.ToTable("Attendances", "dbo");

        builder.HasKey(a => a.Id);

        builder.Property(a => a.Id)
            .HasColumnName("Id")
            .ValueGeneratedOnAdd();

        builder.Property(a => a.BeneficiaryId)
            .HasColumnName("BeneficiaryId")
            .IsRequired();

        builder.Property(a => a.ServiceDate)
            .HasColumnName("ServiceDate")
            .IsRequired();

        builder.Property(a => a.CheckInTime)
            .HasColumnName("CheckInTime")
            .IsRequired();

        builder.Property(a => a.CheckInMethod)
            .HasColumnName("CheckInMethod")
            .HasMaxLength(20)
            .HasDefaultValue("Manual")
            .IsRequired();

        builder.Property(a => a.Notes)
            .HasColumnName("Notes")
            .HasMaxLength(500);

        builder.Property(a => a.CreatedAt)
            .HasColumnName("CreatedAt")
            .HasDefaultValueSql("GETUTCDATE()")
            .IsRequired();

        builder.Property(a => a.UpdatedAt)
            .HasColumnName("UpdatedAt");

        builder.Property(a => a.IsActive)
            .HasColumnName("IsActive")
            .HasDefaultValue(true)
            .IsRequired();

        builder.HasIndex(a => new { a.BeneficiaryId, a.ServiceDate })
            .IsUnique()
            .HasDatabaseName("IX_Attendances_Beneficiary_Date");

        builder.HasIndex(a => a.ServiceDate)
            .HasDatabaseName("IX_Attendances_ServiceDate");

        builder.HasIndex(a => a.IsActive)
            .HasDatabaseName("IX_Attendances_IsActive");
    }
}
