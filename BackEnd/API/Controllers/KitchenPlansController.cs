using Application.DTOS.Common;
using Application.DTOS.KitchenPlan;
using Application.DTOS.KitchenPreparation;
using Application.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Administrador,Cocinero")]
public class KitchenPlansController : ControllerBase
{
    private readonly IKitchenPlanService _kitchenPlanService;

    public KitchenPlansController(IKitchenPlanService kitchenPlanService)
    {
        _kitchenPlanService = kitchenPlanService;
    }

    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<KitchenPlanResponseDto>), StatusCodes.Status201Created)]
    public async Task<IActionResult> Create([FromBody] CreateKitchenPlanRequestDto request, CancellationToken cancellationToken)
    {
        var created = await _kitchenPlanService.CreateAsync(request, cancellationToken);
        return StatusCode(StatusCodes.Status201Created,
            ApiResponse<KitchenPlanResponseDto>.Ok(created, "Plan diario creado exitosamente."));
    }

    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<PagedResponseDto<KitchenPlanResponseDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll([FromQuery] int page = 1, [FromQuery] int pageSize = 10, CancellationToken cancellationToken = default)
    {
        var result = await _kitchenPlanService.GetAllPagedAsync(page, pageSize, cancellationToken);
        return Ok(ApiResponse<PagedResponseDto<KitchenPlanResponseDto>>.Ok(result));
    }

    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(ApiResponse<KitchenPlanResponseDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetById(int id, CancellationToken cancellationToken)
    {
        var plan = await _kitchenPlanService.GetByIdAsync(id, cancellationToken);
        if (plan is null)
            return NotFound(ApiResponse<object>.Fail("Plan no encontrado."));
        return Ok(ApiResponse<KitchenPlanResponseDto>.Ok(plan));
    }

    [HttpGet("by-date")]
    [ProducesResponseType(typeof(ApiResponse<List<KitchenPlanResponseDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetByDate([FromQuery] DateOnly date, CancellationToken cancellationToken)
    {
        var result = await _kitchenPlanService.GetByDateAsync(date, cancellationToken);
        return Ok(ApiResponse<List<KitchenPlanResponseDto>>.Ok(result));
    }
    
    [HttpPost("preparations")]
    [ProducesResponseType(typeof(ApiResponse<KitchenPlanResponseDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> AddPreparation([FromBody] CreatePreparationRequestDto request, CancellationToken cancellationToken)
    {
        var result = await _kitchenPlanService.AddPreparationAsync(request, cancellationToken);
        return Ok(ApiResponse<KitchenPlanResponseDto>.Ok(result, "Preparación agregada al plan."));
    }
}
