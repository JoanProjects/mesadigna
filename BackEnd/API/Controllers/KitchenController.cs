using Application.DTOS.Common;
using Application.DTOS.Ingredient;
using Application.DTOS.Kitchen;
using Application.DTOS.Prediction;
using Application.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Administrador,Cocinero")]
public class KitchenController : ControllerBase
{
    private readonly IKitchenService _kitchenService;
    private readonly IPredictionOrchestrationService _predictionService;

    public KitchenController(IKitchenService kitchenService, IPredictionOrchestrationService predictionService)
    {
        _kitchenService = kitchenService;
        _predictionService = predictionService;
    }
    
    [HttpGet("daily-summary")]
    [ProducesResponseType(typeof(ApiResponse<DailyKitchenSummaryDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetDailySummary([FromQuery] DateOnly date, CancellationToken cancellationToken)
    {
        var result = await _kitchenService.GetDailySummaryAsync(date, cancellationToken);
        return Ok(ApiResponse<DailyKitchenSummaryDto>.Ok(result));
    }

    [HttpGet("diet-category/{categoryKey}/beneficiaries")]
    [ProducesResponseType(typeof(ApiResponse<PagedResponseDto<DietCategoryBeneficiaryDto>>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> GetBeneficiariesByCategory(
        string categoryKey,
        [FromQuery] DateOnly date,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 50,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var result =
                await _kitchenService.GetBeneficiariesByCategoryAsync(date, categoryKey, page, pageSize,
                    cancellationToken);
            return Ok(ApiResponse<PagedResponseDto<DietCategoryBeneficiaryDto>>.Ok(result));
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ApiResponse<object>.Fail(ex.Message));
        }
    }
    
    [HttpGet("dietary-summary")]
    [ProducesResponseType(typeof(ApiResponse<DietarySummaryDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetDietarySummary(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] DateOnly? startDate = null,
        [FromQuery] DateOnly? endDate = null,
        [FromQuery] string? search = null,
        CancellationToken cancellationToken = default)
    {
        var result =
            await _kitchenService.GetDietarySummaryAsync(page, pageSize, startDate, endDate, search, cancellationToken);
        return Ok(ApiResponse<DietarySummaryDto>.Ok(result));
    }

    [HttpGet("ingredients-summary")]
    [ProducesResponseType(typeof(ApiResponse<IngredientsSummaryDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetIngredientsSummary(CancellationToken cancellationToken)
    {
        var result = await _kitchenService.GetIngredientsSummaryAsync(cancellationToken);
        return Ok(ApiResponse<IngredientsSummaryDto>.Ok(result));
    }

    [HttpGet("daily-operational-summary")]
    [ProducesResponseType(typeof(ApiResponse<DailyOperationalSummaryDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetDailyOperationalSummary([FromQuery] DateOnly date,
        CancellationToken cancellationToken)
    {
        var result = await _kitchenService.GetDailyOperationalSummaryAsync(date, cancellationToken);
        return Ok(ApiResponse<DailyOperationalSummaryDto>.Ok(result));
    }

    [HttpGet("recommended-portions")]
    [ProducesResponseType(typeof(ApiResponse<PortionPredictionResponseDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetRecommendedPortions([FromQuery] DateOnly date,
        CancellationToken cancellationToken)
    {
        var existing = await _predictionService.GetLatestByDateAsync(date, cancellationToken);
        if (existing is not null)
            return Ok(ApiResponse<PortionPredictionResponseDto>.Ok(existing));

        var generated = await _predictionService.GeneratePredictionAsync(date, cancellationToken);
        return Ok(ApiResponse<PortionPredictionResponseDto>.Ok(generated, "Predicción generada automáticamente."));
    }

    [HttpPut("actual-portions")]
    [ProducesResponseType(typeof(ApiResponse<string>), StatusCodes.Status200OK)]
    public async Task<IActionResult> UpdateActualPortions(
        [FromQuery] DateOnly date,
        [FromBody] UpdateActualPortionsDto request,
        CancellationToken cancellationToken)
    {
        await _predictionService.UpdateActualPortionsAsync(date, request.ActualPortionsPrepared, request.WastedPortions,
            cancellationToken);
        return Ok(ApiResponse<string>.Ok("Porciones reales registradas.",
            "Porciones reales y desperdicio registrados exitosamente."));
    }
}