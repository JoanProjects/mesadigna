using Application.DTOS;
using Application.DTOS.Attendance;
using Application.Services.Interfaces;
using Core.Domain.Entities;
using Core.Domain.Enums;
using Core.Domain.Exception;
using Core.Domain.Interfaces.Repositories;
using Microsoft.Extensions.Logging;

namespace Application.Services;

public class AttendanceService : IAttendanceService
{
    private readonly IAttendanceRepository _attendanceRepository;
    private readonly IBeneficiaryRepository _beneficiaryRepository;
    private readonly ILogger<AttendanceService> _logger;

    public AttendanceService(
        IAttendanceRepository attendanceRepository,
        IBeneficiaryRepository beneficiaryRepository,
        ILogger<AttendanceService> logger)
    {
        _attendanceRepository = attendanceRepository;
        _beneficiaryRepository = beneficiaryRepository;
        _logger = logger;
    }

    public async Task<AttendanceResponseDto> CheckInAsync(CheckInRequestDto request,
        CancellationToken cancellationToken = default)
    {
        // Resolver beneficiario por Id o InternalCode
        Beneficiary? beneficiary = null;

        if (request.BeneficiaryId.HasValue)
        {
            beneficiary = await _beneficiaryRepository.GetByIdAsync(request.BeneficiaryId.Value, cancellationToken);
        }
        else if (!string.IsNullOrWhiteSpace(request.InternalCode))
        {
            beneficiary =
                await _beneficiaryRepository.GetByInternalCodeAsync(request.InternalCode.Trim(), cancellationToken);
        }

        if (beneficiary is null)
            throw new KeyNotFoundException("Beneficiario no encontrado. Verifique el Id o código interno.");

        if (beneficiary.Status != BeneficiaryStatus.Activo)
            throw new InvalidOperationException("El beneficiario no está activo y no puede registrar asistencia.");

        var today = DateOnly.FromDateTime(DateTime.UtcNow);

        // Verificar doble check-in
        var alreadyCheckedIn =
            await _attendanceRepository.ExistsForBeneficiaryOnDateAsync(beneficiary.Id, today, cancellationToken);
        if (alreadyCheckedIn)
            throw new ConflictException("El beneficiario ya registró asistencia el día de hoy.", "beneficiaryId");

        var attendance = new Attendance
        {
            BeneficiaryId = beneficiary.Id,
            ServiceDate = today,
            CheckInTime = DateTime.UtcNow,
            CheckInMethod = request.CheckInMethod,
            Notes = request.Notes?.Trim()
        };

        var created = await _attendanceRepository.AddAsync(attendance, cancellationToken);

        // Asignar la referencia para el mapeo
        created.Beneficiary = beneficiary;

        _logger.LogInformation("Check-in registrado: Beneficiario {Id} ({Code}) - {Date}",
            beneficiary.Id, beneficiary.InternalCode, today);

        return created.ToDto();
    }

    public async Task<List<AttendanceResponseDto>> GetByDateAsync(DateOnly date,
        CancellationToken cancellationToken = default)
    {
        var attendances = await _attendanceRepository.GetByDateAsync(date, cancellationToken);
        return attendances.Select(a => a.ToDto()).ToList();
    }

    public async Task<List<AttendanceResponseDto>> GetByDateRangeAsync(DateOnly from, DateOnly to,
        CancellationToken cancellationToken = default)
    {
        if (from > to)
            throw new ArgumentException("La fecha 'from' no puede ser posterior a 'to'.");

        var attendances = await _attendanceRepository.GetByDateRangeAsync(from, to, cancellationToken);
        return attendances.Select(a => a.ToDto()).ToList();
    }

    public async Task<DailySummaryResponseDto> GetDailySummaryAsync(DateOnly date,
        CancellationToken cancellationToken = default)
    {
        var attendances = await _attendanceRepository.GetByDateWithBeneficiaryAndHealthAsync(date, cancellationToken);

        var summary = new DailySummaryResponseDto
        {
            Date = date.ToString("yyyy-MM-dd"),
            TotalAttendees = attendances.Count,
            TotalMale = attendances.Count(a => a.Beneficiary.Sex == Sex.Masculino),
            TotalFemale = attendances.Count(a => a.Beneficiary.Sex == Sex.Femenino),
            TotalOther = attendances.Count(a => a.Beneficiary.Sex == Sex.Otro),
            TotalMinors = attendances.Count(a => a.Beneficiary.Age < 18),
            TotalElders = attendances.Count(a => a.Beneficiary.Age >= 65),
            TotalWithDietaryConsiderations = attendances.Count(a =>
                a.Beneficiary.HealthProfile is not null &&
                a.Beneficiary.HealthProfile.HasDietaryConsiderations)
        };

        return summary;
    }
}