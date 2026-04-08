using Application.DTOS.Attendance;
using Application.DTOS.Common;
using Application.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[ApiController]
[Route($"api/[controller]")]
[Authorize(Roles = "Administrador,Recepcionista,Voluntario")]
public class AttendancesController : ControllerBase
{
    private readonly IAttendanceService _attendanceService;

    public AttendancesController(IAttendanceService attendanceService)
    {
        _attendanceService = attendanceService;
    }

    [HttpPost("check-in")]
    [ProducesResponseType(typeof(ApiResponse<AttendanceResponseDto>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CheckIn(
        [FromBody] CheckInRequestDto request,
        CancellationToken cancellationToken)
    {
        var result = await _attendanceService.CheckInAsync(request, cancellationToken);
        return StatusCode(StatusCodes.Status201Created,
            ApiResponse<AttendanceResponseDto>.Ok(result, "Check-in registrado exitosamente."));
    }
    
    [HttpGet("by-date")]
    [ProducesResponseType(typeof(ApiResponse<List<AttendanceResponseDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetByDate(
        [FromQuery] DateOnly date,
        CancellationToken cancellationToken)
    {
        var result = await _attendanceService.GetByDateAsync(date, cancellationToken);
        return Ok(ApiResponse<List<AttendanceResponseDto>>.Ok(result));
    }
    
    [HttpGet("by-range")]
    [ProducesResponseType(typeof(ApiResponse<List<AttendanceResponseDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetByRange(
        [FromQuery] DateOnly from,
        [FromQuery] DateOnly to,
        CancellationToken cancellationToken)
    {
        var result = await _attendanceService.GetByDateRangeAsync(from, to, cancellationToken);
        return Ok(ApiResponse<List<AttendanceResponseDto>>.Ok(result));
    }
    
    [HttpGet("summary-daily")]
    [ProducesResponseType(typeof(ApiResponse<DailySummaryResponseDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetDailySummary(
        [FromQuery] DateOnly date,
        CancellationToken cancellationToken)
    {
        var result = await _attendanceService.GetDailySummaryAsync(date, cancellationToken);
        return Ok(ApiResponse<DailySummaryResponseDto>.Ok(result));
    }
}