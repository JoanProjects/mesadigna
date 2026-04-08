using Application.DTOS.Attendance;

namespace Application.Services.Interfaces;

public interface IAttendanceService
{
    Task<AttendanceResponseDto> CheckInAsync(CheckInRequestDto request, CancellationToken cancellationToken = default);
    Task<List<AttendanceResponseDto>> GetByDateAsync(DateOnly date, CancellationToken cancellationToken = default);

    Task<List<AttendanceResponseDto>> GetByDateRangeAsync(DateOnly from, DateOnly to,
        CancellationToken cancellationToken = default);

    Task<DailySummaryResponseDto> GetDailySummaryAsync(DateOnly date, CancellationToken cancellationToken = default);
}