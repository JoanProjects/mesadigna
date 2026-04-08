using Application.DTOS;
using Application.DTOS.Common;
using Application.DTOS.KitchenPlan;
using Application.DTOS.KitchenPreparation;
using Application.Services.Interfaces;
using Core.Domain.Entities;
using Core.Domain.Exception;
using Core.Domain.Interfaces.Repositories;
using Microsoft.Extensions.Logging;

namespace Application.Services;

public class KitchenPlanService : IKitchenPlanService
{
    private readonly IDailyKitchenPlanRepository _planRepository;
    private readonly IMealRepository _mealRepository;
    private readonly IBaseRepository<KitchenPreparation> _preparationRepository;
    private readonly ILogger<KitchenPlanService> _logger;

    public KitchenPlanService(
        IDailyKitchenPlanRepository planRepository,
        IMealRepository mealRepository,
        IBaseRepository<KitchenPreparation> preparationRepository,
        ILogger<KitchenPlanService> logger)
    {
        _planRepository = planRepository;
        _mealRepository = mealRepository;
        _preparationRepository = preparationRepository;
        _logger = logger;
    }

    public async Task<KitchenPlanResponseDto> CreateAsync(CreateKitchenPlanRequestDto request,
        CancellationToken cancellationToken = default)
    {
        var exists = await _planRepository.ExistsAsync(
            p => p.PlanDate == request.PlanDate && p.MealType == request.MealType, cancellationToken);
        if (exists)
            throw new ConflictException(
                $"Ya existe un plan para {request.PlanDate:yyyy-MM-dd} tipo {request.MealType}.", "planDate");

        var plan = new DailyKitchenPlan
        {
            PlanDate = request.PlanDate,
            MealType = request.MealType,
            EstimatedBeneficiaries = request.EstimatedBeneficiaries,
            EstimatedServings = request.EstimatedServings,
            Notes = request.Notes?.Trim()
        };

        var created = await _planRepository.AddAsync(plan, cancellationToken);
        _logger.LogInformation("Plan diario creado: {Id} para {Date}", created.Id, created.PlanDate);
        return created.ToDto();
    }

    public async Task<KitchenPlanResponseDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        var plan = await _planRepository.GetByIdWithPreparationsAsync(id, cancellationToken);
        return plan?.ToDto();
    }

    public async Task<List<KitchenPlanResponseDto>> GetByDateAsync(DateOnly date,
        CancellationToken cancellationToken = default)
    {
        var plans = await _planRepository.GetByDateAsync(date, cancellationToken);
        return plans.Select(p => p.ToDto()).ToList();
    }

    public async Task<PagedResponseDto<KitchenPlanResponseDto>> GetAllPagedAsync(int page, int pageSize,
        CancellationToken cancellationToken = default)
    {
        var pagedResult = await _planRepository.GetPagedAsync(
            page, pageSize,
            orderBy: p => p.PlanDate,
            cancellationToken: cancellationToken);

        var dtoItems = pagedResult.Items.Select(p => p.ToDto()).ToList().AsReadOnly();
        return new PagedResponseDto<KitchenPlanResponseDto>
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

    public async Task<KitchenPlanResponseDto> AddPreparationAsync(CreatePreparationRequestDto request,
        CancellationToken cancellationToken = default)
    {
        var plan = await _planRepository.GetByIdAsync(request.DailyKitchenPlanId, cancellationToken);
        if (plan is null)
            throw new KeyNotFoundException($"No se encontró el plan con Id {request.DailyKitchenPlanId}.");

        var meal = await _mealRepository.GetByIdAsync(request.MealId, cancellationToken);
        if (meal is null)
            throw new KeyNotFoundException($"No se encontró la comida con Id {request.MealId}.");

        var preparation = new KitchenPreparation
        {
            DailyKitchenPlanId = request.DailyKitchenPlanId,
            MealId = request.MealId,
            DietType = request.DietType,
            EstimatedServings = request.EstimatedServings,
            Notes = request.Notes?.Trim()
        };

        await _preparationRepository.AddAsync(preparation, cancellationToken);
        _logger.LogInformation("Preparación agregada al plan {PlanId}: Comida {MealId}, {Servings} raciones",
            request.DailyKitchenPlanId, request.MealId, request.EstimatedServings);

        var updated = await _planRepository.GetByIdWithPreparationsAsync(request.DailyKitchenPlanId, cancellationToken);
        return updated!.ToDto();
    }
}