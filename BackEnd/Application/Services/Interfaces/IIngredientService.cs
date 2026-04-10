using Application.DTOS.Common;
using Application.DTOS.Ingredient;

namespace Application.Services.Interfaces;

public interface IIngredientService
{
    Task<IngredientResponseDto> CreateAsync(CreateIngredientRequestDto request,
        CancellationToken cancellationToken = default);

    Task<IngredientResponseDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default);

    Task<PagedResponseDto<IngredientResponseDto>> GetAllPagedAsync(int page, int pageSize, string? search = null,
        CancellationToken cancellationToken = default);

    Task<IngredientResponseDto?> UpdateAsync(int id, UpdateIngredientRequestDto request,
        CancellationToken cancellationToken = default);

    Task<bool> ChangeStatusAsync(int id, CancellationToken cancellationToken = default);
}