using Application.DTOS.Common;
using Application.DTOS.KitchenPlan;
using Application.DTOS.KitchenPreparation;

namespace Application.Services.Interfaces;

public interface IKitchenPlanService
{
    Task<KitchenPlanResponseDto> CreateAsync(CreateKitchenPlanRequestDto request,
        CancellationToken cancellationToken = default);

    Task<KitchenPlanResponseDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<List<KitchenPlanResponseDto>> GetByDateAsync(DateOnly date, CancellationToken cancellationToken = default);

    Task<PagedResponseDto<KitchenPlanResponseDto>> GetAllPagedAsync(int page, int pageSize,
        CancellationToken cancellationToken = default);

    Task<KitchenPlanResponseDto> AddPreparationAsync(CreatePreparationRequestDto request,
        CancellationToken cancellationToken = default);
}