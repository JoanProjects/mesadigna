using Application.DTOS.Common;
using Application.DTOS.Meal;
using Application.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Administrador,Cocinero")]
public class MealsController : ControllerBase
{
    private readonly IMealService _mealService;

    public MealsController(IMealService mealService)
    {
        _mealService = mealService;
    }

    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<MealResponseDto>), StatusCodes.Status201Created)]
    public async Task<IActionResult> Create([FromBody] CreateMealRequestDto request, CancellationToken cancellationToken)
    {
        var created = await _mealService.CreateAsync(request, cancellationToken);
        return StatusCode(StatusCodes.Status201Created,
            ApiResponse<MealResponseDto>.Ok(created, "Comida creada exitosamente."));
    }

    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<PagedResponseDto<MealResponseDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll([FromQuery] int page = 1, [FromQuery] int pageSize = 10, [FromQuery] string? search = null, CancellationToken cancellationToken = default)
    {
        var result = await _mealService.GetAllPagedAsync(page, pageSize, search, cancellationToken);
        return Ok(ApiResponse<PagedResponseDto<MealResponseDto>>.Ok(result));
    }

    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(ApiResponse<MealResponseDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetById(int id, CancellationToken cancellationToken)
    {
        var meal = await _mealService.GetByIdAsync(id, cancellationToken);
        if (meal is null)
            return NotFound(ApiResponse<object>.Fail("Comida no encontrada."));
        return Ok(ApiResponse<MealResponseDto>.Ok(meal));
    }

    [HttpPut("{id:int}")]
    [ProducesResponseType(typeof(ApiResponse<MealResponseDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateMealRequestDto request, CancellationToken cancellationToken)
    {
        var updated = await _mealService.UpdateAsync(id, request, cancellationToken);
        if (updated is null)
            return NotFound(ApiResponse<object>.Fail("Comida no encontrada."));
        return Ok(ApiResponse<MealResponseDto>.Ok(updated, "Comida actualizada exitosamente."));
    }

    [HttpPost("{id:int}/ingredients")]
    [ProducesResponseType(typeof(ApiResponse<MealResponseDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> AddIngredient(int id, [FromBody] AddMealIngredientRequestDto request, CancellationToken cancellationToken)
    {
        var result = await _mealService.AddIngredientAsync(id, request, cancellationToken);
        return Ok(ApiResponse<MealResponseDto>.Ok(result, "Ingrediente agregado a la comida."));
    }
    
    [HttpDelete("{id:int}/ingredients/{ingredientId:int}")]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
    public async Task<IActionResult> RemoveIngredient(int id, int ingredientId, CancellationToken cancellationToken)
    {
        var result = await _mealService.RemoveIngredientAsync(id, ingredientId, cancellationToken);
        if (!result)
            return NotFound(ApiResponse<object>.Fail("Relación comida-ingrediente no encontrada."));
        return Ok(ApiResponse<object>.Ok(null!, "Ingrediente removido de la comida."));
    }
}
