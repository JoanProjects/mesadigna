using Core.Domain.Entities;
using Infrastructure.Data;
using Infrastructure.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories;

public class AttendanceRepository : BaseRepository<Attendance>, IAttendanceRepository
{
    public AttendanceRepository(ApplicationDbContext context) : base(context)
    {
    }

    public async Task<bool> ExistsForBeneficiaryOnDateAsync(int beneficiaryId, DateOnly serviceDate,
        CancellationToken cancellationToken = default)
    {
        return await DbSet
            .AnyAsync(a => a.BeneficiaryId == beneficiaryId && a.ServiceDate == serviceDate, cancellationToken);
    }

    public async Task<List<Attendance>> GetByDateAsync(DateOnly date, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .AsNoTracking()
            .Include(a => a.Beneficiary)
            .Where(a => a.ServiceDate == date)
            .OrderBy(a => a.CheckInTime)
            .ToListAsync(cancellationToken);
    }

    public async Task<List<Attendance>> GetByDateRangeAsync(DateOnly from, DateOnly to,
        CancellationToken cancellationToken = default)
    {
        return await DbSet
            .AsNoTracking()
            .Include(a => a.Beneficiary)
            .Where(a => a.ServiceDate >= from && a.ServiceDate <= to)
            .OrderBy(a => a.ServiceDate)
            .ThenBy(a => a.CheckInTime)
            .ToListAsync(cancellationToken);
    }

    public async Task<int> GetCountByDateAsync(DateOnly date, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .CountAsync(a => a.ServiceDate == date, cancellationToken);
    }

    public async Task<List<Attendance>> GetByDateWithBeneficiaryAndHealthAsync(DateOnly date,
        CancellationToken cancellationToken = default)
    {
        return await DbSet
            .AsNoTracking()
            .Include(a => a.Beneficiary)
            .ThenInclude(b => b.HealthProfile)
            .Where(a => a.ServiceDate == date)
            .OrderBy(a => a.CheckInTime)
            .ToListAsync(cancellationToken);
    }
}