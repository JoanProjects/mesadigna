using Application.DTOS;
using Application.DTOS.Common;
using Application.DTOS.Ingredient;
using Application.Services.Interfaces;
using Core.Domain.Entities;
using Core.Domain.Exception;
using Core.Domain.Interfaces.Repositories;
using Microsoft.Extensions.Logging;

namespace Application.Services;

public class IngredientService : IIngredientService
{
    private readonly IIngredientRepository _ingredientRepository;
    private readonly ILogger<IngredientService> _logger;

    public IngredientService(IIngredientRepository ingredientRepository, ILogger<IngredientService> logger)
    {
        _ingredientRepository = ingredientRepository;
        _logger = logger;
    }

    public async Task<IngredientResponseDto> CreateAsync(CreateIngredientRequestDto request, CancellationToken cancellationToken = default)
    {
        if (await _ingredientRepository.ExistsByNameAsync(request.Name.Trim(), cancellationToken: cancellationToken))
            throw new ConflictException("Ya existe un ingrediente con ese nombre.", "name");

        var ingredient = new Ingredient
        {
            Name = request.Name.Trim(),
            Description = request.Description?.Trim(),
            UnitOfMeasure = request.UnitOfMeasure,
            StockQuantity = request.StockQuantity,
            MinimumStock = request.MinimumStock
        };

        var created = await _ingredientRepository.AddAsync(ingredient, cancellationToken);
        _logger.LogInformation("Ingrediente creado: {Id} - {Name}", created.Id, created.Name);
        return created.ToDto();
    }

    public async Task<IngredientResponseDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        var ingredient = await _ingredientRepository.GetByIdAsync(id, cancellationToken);
        return ingredient?.ToDto();
    }

    public async Task<PagedResponseDto<IngredientResponseDto>> GetAllPagedAsync(int page, int pageSize, string? search = null, CancellationToken cancellationToken = default)
    {
        var pagedResult = await _ingredientRepository.GetPagedAsync(
            page, pageSize,
            filter: string.IsNullOrWhiteSpace(search)
                ? null
                : i => i.Name.ToLower().Contains(search.ToLower()),
            orderBy: i => i.Name,
            cancellationToken: cancellationToken);

        var dtoItems = pagedResult.Items.Select(i => i.ToDto()).ToList().AsReadOnly();
        return new PagedResponseDto<IngredientResponseDto>
        {
            Items = dtoItems,
            Page = pagedResult.Page,
            PageSize = pagedResult.PageSize,
            TotalCount = pagedResult.TotalCount,
            TotalPages = pagedResult.TotalPages,
            HasPreviousPage = pagedResult.HasPreviousPage,
            HasNextPage = pagedResult.HasNextPage
        };
    }

    public async Task<IngredientResponseDto?> UpdateAsync(int id, UpdateIngredientRequestDto request, CancellationToken cancellationToken = default)
    {
        var ingredient = await _ingredientRepository.GetByIdTrackedAsync(id, cancellationToken);
        if (ingredient is null) return null;

        if (await _ingredientRepository.ExistsByNameAsync(request.Name.Trim(), id, cancellationToken))
            throw new ConflictException("Ya existe otro ingrediente con ese nombre.", "name");

        ingredient.Name = request.Name.Trim();
        ingredient.Description = request.Description?.Trim();
        ingredient.UnitOfMeasure = request.UnitOfMeasure;
        ingredient.StockQuantity = request.StockQuantity;
        ingredient.MinimumStock = request.MinimumStock;

        await _ingredientRepository.SaveChangesAsync(cancellationToken);
        _logger.LogInformation("Ingrediente actualizado: {Id}", id);
        return ingredient.ToDto();
    }

    public async Task<bool> ChangeStatusAsync(int id, CancellationToken cancellationToken = default)
    {
        var ingredient = await _ingredientRepository.GetByIdTrackedAsync(id, cancellationToken);
        if (ingredient is null) return false;

        ingredient.IsActive = !ingredient.IsActive;

        await _ingredientRepository.SaveChangesAsync(cancellationToken);

        _logger.LogInformation(
            "Ingrediente {Estado}: {Id}",
            ingredient.IsActive ? "activado" : "desactivado",
            id);

        return true;
    }
}
