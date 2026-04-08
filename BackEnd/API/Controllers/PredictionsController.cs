using Application.DTOS.Common;
using Application.DTOS.Prediction;
using Application.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Administrador")]
public class PredictionsController : ControllerBase
{
    private readonly IPredictionOrchestrationService _predictionService;

    public PredictionsController(IPredictionOrchestrationService predictionService)
    {
        _predictionService = predictionService;
    }

    [HttpPost("generate")]
    [ProducesResponseType(typeof(ApiResponse<PortionPredictionResponseDto>), StatusCodes.Status201Created)]
    public async Task<IActionResult> Generate(
        [FromBody] GeneratePredictionRequestDto request,
        CancellationToken cancellationToken)
    {
        var result = await _predictionService.GeneratePredictionAsync(request.TargetDate, cancellationToken);
        return StatusCode(StatusCodes.Status201Created,
            ApiResponse<PortionPredictionResponseDto>.Ok(result, "Predicción generada exitosamente."));
    }
    
    [HttpGet("by-date")]
    [ProducesResponseType(typeof(ApiResponse<List<PortionPredictionResponseDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetByDate([FromQuery] DateOnly date, CancellationToken cancellationToken)
    {
        var result = await _predictionService.GetByDateAsync(date, cancellationToken);
        return Ok(ApiResponse<List<PortionPredictionResponseDto>>.Ok(result));
    }
    
    [HttpGet("latest")]
    [ProducesResponseType(typeof(ApiResponse<PortionPredictionResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetLatest([FromQuery] DateOnly date, CancellationToken cancellationToken)
    {
        var result = await _predictionService.GetLatestByDateAsync(date, cancellationToken);
        if (result is null)
            return NotFound(ApiResponse<PortionPredictionResponseDto>.Fail("No hay predicción para esa fecha."));

        return Ok(ApiResponse<PortionPredictionResponseDto>.Ok(result));
    }
    
    [HttpPut("actual-attendance")]
    [ProducesResponseType(typeof(ApiResponse<string>), StatusCodes.Status200OK)]
    public async Task<IActionResult> UpdateActualAttendance(
        [FromQuery] DateOnly date,
        [FromQuery] int count,
        CancellationToken cancellationToken)
    {
        await _predictionService.UpdateActualAttendanceAsync(date, count, cancellationToken);
        return Ok(ApiResponse<string>.Ok("Asistencia real actualizada.", "Asistencia real registrada exitosamente."));
    }
    
    [HttpPut("actual-portions")]
    [ProducesResponseType(typeof(ApiResponse<string>), StatusCodes.Status200OK)]
    public async Task<IActionResult> UpdateActualPortions(
        [FromQuery] DateOnly date,
        [FromBody] UpdateActualPortionsDto request,
        CancellationToken cancellationToken)
    {
        await _predictionService.UpdateActualPortionsAsync(date, request.ActualPortionsPrepared, request.WastedPortions, cancellationToken);
        return Ok(ApiResponse<string>.Ok("Porciones reales registradas.", "Porciones reales y desperdicio registrados exitosamente."));
    }
    
    [HttpGet("accuracy-history")]
    [ProducesResponseType(typeof(ApiResponse<List<AccuracyHistoryItemDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAccuracyHistory(
        [FromQuery] int days = 30,
        CancellationToken cancellationToken = default)
    {
        var result = await _predictionService.GetAccuracyHistoryAsync(days, cancellationToken);
        return Ok(ApiResponse<List<AccuracyHistoryItemDto>>.Ok(result));
    }
    
    [HttpGet("model-info")]
    [ProducesResponseType(typeof(ApiResponse<ModelInfoResponseDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetModelInfo(CancellationToken cancellationToken)
    {
        var result = await _predictionService.GetModelInfoAsync(cancellationToken);
        return Ok(ApiResponse<ModelInfoResponseDto>.Ok(result));
    }
    
    [HttpPost("retrain")]
    [ProducesResponseType(typeof(ApiResponse<RetrainResponseDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> TriggerRetrain(
        [FromBody] RetrainRequestDto request,
        CancellationToken cancellationToken)
    {
        var result = await _predictionService.TriggerRetrainAsync(request.FromDate, request.ToDate, cancellationToken);
        return Ok(ApiResponse<RetrainResponseDto>.Ok(result, "Modelo reentrenado exitosamente."));
    }
}
