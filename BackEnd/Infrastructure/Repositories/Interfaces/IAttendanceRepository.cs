using Core.Domain.Entities;

namespace Infrastructure.Repositories.Interfaces;

public interface IAttendanceRepository : IBaseRepository<Attendance>
{
    Task<bool> ExistsForBeneficiaryOnDateAsync(int beneficiaryId, DateOnly serviceDate, CancellationToken cancellationToken = default);
    Task<List<Attendance>> GetByDateAsync(DateOnly date, CancellationToken cancellationToken = default);
    Task<List<Attendance>> GetByDateRangeAsync(DateOnly from, DateOnly to, CancellationToken cancellationToken = default);
    Task<int> GetCountByDateAsync(DateOnly date, CancellationToken cancellationToken = default);
    Task<List<Attendance>> GetByDateWithBeneficiaryAndHealthAsync(DateOnly date, CancellationToken cancellationToken = default);
}
