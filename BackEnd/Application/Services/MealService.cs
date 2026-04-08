using Application.DTOS;
using Application.DTOS.Common;
using Application.DTOS.Meal;
using Application.Services.Interfaces;
using Core.Domain.Entities;
using Core.Domain.Exception;
using Core.Domain.Interfaces.Repositories;
using Microsoft.Extensions.Logging;

namespace Application.Services;

public class MealService : IMealService
{
    private readonly IMealRepository _mealRepository;
    private readonly IIngredientRepository _ingredientRepository;
    private readonly IBaseRepository<MealIngredient> _mealIngredientRepository;
    private readonly ILogger<MealService> _logger;

    public MealService(
        IMealRepository mealRepository,
        IIngredientRepository ingredientRepository,
        IBaseRepository<MealIngredient> mealIngredientRepository,
        ILogger<MealService> logger)
    {
        _mealRepository = mealRepository;
        _ingredientRepository = ingredientRepository;
        _mealIngredientRepository = mealIngredientRepository;
        _logger = logger;
    }

    public async Task<MealResponseDto> CreateAsync(CreateMealRequestDto request,
        CancellationToken cancellationToken = default)
    {
        if (await _mealRepository.ExistsByNameAsync(request.Name.Trim(), cancellationToken: cancellationToken))
            throw new ConflictException("Ya existe una comida con ese nombre.", "name");

        var meal = new Meal
        {
            Name = request.Name.Trim(),
            Description = request.Description?.Trim(),
            MealType = request.MealType,
            BaseServings = request.BaseServings
        };

        var created = await _mealRepository.AddAsync(meal, cancellationToken);
        _logger.LogInformation("Comida creada: {Id} - {Name}", created.Id, created.Name);
        return created.ToDto();
    }

    public async Task<MealResponseDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        var meal = await _mealRepository.GetByIdWithIngredientsAsync(id, cancellationToken);
        return meal?.ToDto();
    }

    public async Task<PagedResponseDto<MealResponseDto>> GetAllPagedAsync(int page, int pageSize, string? search = null,
        CancellationToken cancellationToken = default)
    {
        var pagedResult = await _mealRepository.GetPagedAsync(
            page, pageSize,
            filter: string.IsNullOrWhiteSpace(search) ? null : m => m.Name.ToLower().Contains(search.ToLower()),
            orderBy: m => m.Name,
            cancellationToken: cancellationToken);

        var dtoItems = pagedResult.Items.Select(m => m.ToDto()).ToList().AsReadOnly();
        return new PagedResponseDto<MealResponseDto>
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

    public async Task<MealResponseDto?> UpdateAsync(int id, UpdateMealRequestDto request,
        CancellationToken cancellationToken = default)
    {
        var meal = await _mealRepository.GetByIdTrackedAsync(id, cancellationToken);
        if (meal is null) return null;

        if (await _mealRepository.ExistsByNameAsync(request.Name.Trim(), id, cancellationToken))
            throw new ConflictException("Ya existe otra comida con ese nombre.", "name");

        meal.Name = request.Name.Trim();
        meal.Description = request.Description?.Trim();
        meal.MealType = request.MealType;
        meal.BaseServings = request.BaseServings;

        await _mealRepository.SaveChangesAsync(cancellationToken);
        _logger.LogInformation("Comida actualizada: {Id}", id);

        var updated = await _mealRepository.GetByIdWithIngredientsAsync(id, cancellationToken);
        return updated?.ToDto();
    }

    public async Task<MealResponseDto> AddIngredientAsync(int mealId, AddMealIngredientRequestDto request,
        CancellationToken cancellationToken = default)
    {
        var meal = await _mealRepository.GetByIdAsync(mealId, cancellationToken);
        if (meal is null)
            throw new KeyNotFoundException($"No se encontró la comida con Id {mealId}.");

        var ingredient = await _ingredientRepository.GetByIdAsync(request.IngredientId, cancellationToken);
        if (ingredient is null)
            throw new KeyNotFoundException($"No se encontró el ingrediente con Id {request.IngredientId}.");

        var exists = await _mealIngredientRepository.ExistsAsync(
            mi => mi.MealId == mealId && mi.IngredientId == request.IngredientId, cancellationToken);
        if (exists)
            throw new ConflictException("Este ingrediente ya está asociado a esta comida.", "ingredientId");

        var mealIngredient = new MealIngredient
        {
            MealId = mealId,
            IngredientId = request.IngredientId,
            QuantityPerServing = request.QuantityPerServing,
            UnitOfMeasure = request.UnitOfMeasure
        };

        await _mealIngredientRepository.AddAsync(mealIngredient, cancellationToken);
        _logger.LogInformation("Ingrediente {IngredientId} asociado a comida {MealId}", request.IngredientId, mealId);

        var updated = await _mealRepository.GetByIdWithIngredientsAsync(mealId, cancellationToken);
        return updated!.ToDto();
    }

    public async Task<bool> RemoveIngredientAsync(int mealId, int ingredientId,
        CancellationToken cancellationToken = default)
    {
        var items = await _mealIngredientRepository.FindAsync(
            mi => mi.MealId == mealId && mi.IngredientId == ingredientId, cancellationToken);

        var mealIngredient = items.FirstOrDefault();
        if (mealIngredient is null) return false;

        var tracked = await _mealIngredientRepository.GetByIdTrackedAsync(mealIngredient.Id, cancellationToken);
        if (tracked is null) return false;

        _mealIngredientRepository.Delete(tracked);
        await _mealIngredientRepository.SaveChangesAsync(cancellationToken);
        _logger.LogInformation("Ingrediente {IngredientId} removido de comida {MealId}", ingredientId, mealId);
        return true;
    }
}