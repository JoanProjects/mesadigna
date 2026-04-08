using Application.DTOS.Common;
using Application.DTOS.Ingredient;
using Application.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Administrador,Cocinero")]
public class IngredientsController : ControllerBase
{
    private readonly IIngredientService _ingredientService;

    public IngredientsController(IIngredientService ingredientService)
    {
        _ingredientService = ingredientService;
    }

    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<IngredientResponseDto>), StatusCodes.Status201Created)]
    public async Task<IActionResult> Create([FromBody] CreateIngredientRequestDto request,
        CancellationToken cancellationToken)
    {
        var created = await _ingredientService.CreateAsync(request, cancellationToken);
        return StatusCode(StatusCodes.Status201Created,
            ApiResponse<IngredientResponseDto>.Ok(created, "Ingrediente creado exitosamente."));
    }

    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<PagedResponseDto<IngredientResponseDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll([FromQuery] int page = 1, [FromQuery] int pageSize = 10,
        [FromQuery] string? search = null, CancellationToken cancellationToken = default)
    {
        var result = await _ingredientService.GetAllPagedAsync(page, pageSize, search, cancellationToken);
        return Ok(ApiResponse<PagedResponseDto<IngredientResponseDto>>.Ok(result));
    }

    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(ApiResponse<IngredientResponseDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetById(int id, CancellationToken cancellationToken)
    {
        var ingredient = await _ingredientService.GetByIdAsync(id, cancellationToken);
        if (ingredient is null)
            return NotFound(ApiResponse<object>.Fail("Ingrediente no encontrado."));
        return Ok(ApiResponse<IngredientResponseDto>.Ok(ingredient));
    }

    [HttpPut("{id:int}")]
    [ProducesResponseType(typeof(ApiResponse<IngredientResponseDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateIngredientRequestDto request,
        CancellationToken cancellationToken)
    {
        var updated = await _ingredientService.UpdateAsync(id, request, cancellationToken);
        if (updated is null)
            return NotFound(ApiResponse<object>.Fail("Ingrediente no encontrado."));
        return Ok(ApiResponse<IngredientResponseDto>.Ok(updated, "Ingrediente actualizado exitosamente."));
    }

    [HttpDelete("{id:int}")]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
    public async Task<IActionResult> Deactivate(int id, CancellationToken cancellationToken)
    {
        var result = await _ingredientService.DeactivateAsync(id, cancellationToken);
        if (!result)
            return NotFound(ApiResponse<object>.Fail("Ingrediente no encontrado."));
        return Ok(ApiResponse<object>.Ok(null!, "Ingrediente desactivado exitosamente."));
    }
}