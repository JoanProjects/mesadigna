using Application.DTOS.Common;
using Application.DTOS.Meal;

namespace Application.Services.Interfaces;

public interface IMealService
{
    Task<MealResponseDto> CreateAsync(CreateMealRequestDto request, CancellationToken cancellationToken = default);
    Task<MealResponseDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default);

    Task<PagedResponseDto<MealResponseDto>> GetAllPagedAsync(int page, int pageSize, string? search = null,
        CancellationToken cancellationToken = default);

    Task<MealResponseDto?> UpdateAsync(int id, UpdateMealRequestDto request,
        CancellationToken cancellationToken = default);

    Task<MealResponseDto> AddIngredientAsync(int mealId, AddMealIngredientRequestDto request,
        CancellationToken cancellationToken = default);

    Task<bool> RemoveIngredientAsync(int mealId, int ingredientId, CancellationToken cancellationToken = default);
}