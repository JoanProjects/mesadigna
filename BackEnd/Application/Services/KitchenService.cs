using Application.DTOS;
using Application.DTOS.Common;
using Application.DTOS.Ingredient;
using Application.DTOS.Kitchen;
using Application.Services.Interfaces;
using Core.Domain.Entities;
using Core.Domain.Interfaces.Repositories;
using Microsoft.Extensions.Logging;

namespace Application.Services;

public class KitchenService : IKitchenService
{
    private readonly IAttendanceRepository _attendanceRepository;
    private readonly IHealthProfileRepository _healthProfileRepository;
    private readonly IIngredientRepository _ingredientRepository;
    private readonly IDailyKitchenPlanRepository _planRepository;
    private readonly ILogger<KitchenService> _logger;

    public KitchenService(
        IAttendanceRepository attendanceRepository,
        IHealthProfileRepository healthProfileRepository,
        IIngredientRepository ingredientRepository,
        IDailyKitchenPlanRepository planRepository,
        ILogger<KitchenService> logger)
    {
        _attendanceRepository = attendanceRepository;
        _healthProfileRepository = healthProfileRepository;
        _ingredientRepository = ingredientRepository;
        _planRepository = planRepository;
        _logger = logger;
    }

    public async Task<DailyKitchenSummaryDto> GetDailySummaryAsync(DateOnly date,
        CancellationToken cancellationToken = default)
    {
        var attendances = await _attendanceRepository.GetByDateWithBeneficiaryAndHealthAsync(date, cancellationToken);

        var specialDietBeneficiaries = attendances
            .Where(a => a.Beneficiary.HealthProfile is not null && a.Beneficiary.HealthProfile.HasDietaryConsiderations)
            .ToList();

        var categories = new List<DietCategoryCountDto>();

        var hypertensionCount = specialDietBeneficiaries.Count(a => a.Beneficiary.HealthProfile!.HasHypertension);
        if (hypertensionCount > 0)
            categories.Add(new DietCategoryCountDto
                { Category = "Hipertensión", CategoryKey = "hypertension", Count = hypertensionCount });

        var diabetesCount = specialDietBeneficiaries.Count(a => a.Beneficiary.HealthProfile!.HasDiabetes);
        if (diabetesCount > 0)
            categories.Add(new DietCategoryCountDto
                { Category = "Diabetes", CategoryKey = "diabetes", Count = diabetesCount });

        var allergiesCount =
            specialDietBeneficiaries.Count(a => !string.IsNullOrWhiteSpace(a.Beneficiary.HealthProfile!.Allergies));
        if (allergiesCount > 0)
            categories.Add(new DietCategoryCountDto
                { Category = "Alergias", CategoryKey = "allergies", Count = allergiesCount });

        var restrictionsCount = specialDietBeneficiaries.Count(a =>
            !string.IsNullOrWhiteSpace(a.Beneficiary.HealthProfile!.DietaryRestrictions));
        if (restrictionsCount > 0)
            categories.Add(new DietCategoryCountDto
            {
                Category = "Restricciones alimentarias", CategoryKey = "dietary_restrictions", Count = restrictionsCount
            });

        return new DailyKitchenSummaryDto
        {
            Date = date.ToString("yyyy-MM-dd"),
            TotalServings = attendances.Count,
            RegularServings = attendances.Count - specialDietBeneficiaries.Count,
            SpecialDietServings = specialDietBeneficiaries.Count,
            DietCategories = categories
        };
    }

    /// <summary>
    /// Categorías válidas para el endpoint de detalle por categoría de dieta.
    /// </summary>
    private static readonly Dictionary<string, Func<Attendance, bool>> CategoryFilters =
        new(StringComparer.OrdinalIgnoreCase)
        {
            ["hypertension"] = a => a.Beneficiary.HealthProfile!.HasHypertension,
            ["diabetes"] = a => a.Beneficiary.HealthProfile!.HasDiabetes,
            ["allergies"] = a => !string.IsNullOrWhiteSpace(a.Beneficiary.HealthProfile!.Allergies),
            ["dietary_restrictions"] = a => !string.IsNullOrWhiteSpace(a.Beneficiary.HealthProfile!.DietaryRestrictions)
        };

    public async Task<PagedResponseDto<DietCategoryBeneficiaryDto>> GetBeneficiariesByCategoryAsync(
        DateOnly date, string categoryKey, int page = 1, int pageSize = 10,
        CancellationToken cancellationToken = default)
    {
        if (!CategoryFilters.TryGetValue(categoryKey, out var filter))
            throw new ArgumentException(
                $"Categoría no válida: '{categoryKey}'. Categorías válidas: {string.Join(", ", CategoryFilters.Keys)}");

        var attendances = await _attendanceRepository.GetByDateWithBeneficiaryAndHealthAsync(date, cancellationToken);

        var filtered = attendances
            .Where(a => a.Beneficiary.HealthProfile is not null && a.Beneficiary.HealthProfile.HasDietaryConsiderations)
            .Where(filter)
            .Select(a => new DietCategoryBeneficiaryDto
            {
                BeneficiaryId = a.BeneficiaryId,
                FullName = a.Beneficiary.FullName,
                InternalCode = a.Beneficiary.InternalCode
            })
            .OrderBy(b => b.FullName)
            .ToList();

        var totalCount = filtered.Count;
        var totalPages = (int)Math.Ceiling(totalCount / (double)pageSize);
        var items = filtered.Skip((page - 1) * pageSize).Take(pageSize).ToList();

        return new PagedResponseDto<DietCategoryBeneficiaryDto>
        {
            Items = items,
            Page = page,
            PageSize = pageSize,
            TotalCount = totalCount,
            TotalPages = totalPages,
            HasPreviousPage = page > 1,
            HasNextPage = page < totalPages
        };
    }


    public async Task<DietarySummaryDto> GetDietarySummaryAsync(
        int page = 1, int pageSize = 10, DateOnly? startDate = null, DateOnly? endDate = null,
        string? search = null, CancellationToken cancellationToken = default)
    {
        var (items, totalCount) = await _healthProfileRepository
            .GetProfilesWithDietaryConsiderationsPagedAsync(page, pageSize, startDate, endDate, search,
                cancellationToken);

        var totalPages = (int)Math.Ceiling(totalCount / (double)pageSize);

        return new DietarySummaryDto
        {
            TotalBeneficiariesWithRestrictions = totalCount,
            Beneficiaries = new PagedResponseDto<DietaryBeneficiaryDto>
            {
                Items = items.Select(hp => hp.ToDietaryDto()).ToList(),
                Page = page,
                PageSize = pageSize,
                TotalCount = totalCount,
                TotalPages = totalPages,
                HasPreviousPage = page > 1,
                HasNextPage = page < totalPages
            }
        };
    }

    public async Task<IngredientsSummaryDto> GetIngredientsSummaryAsync(CancellationToken cancellationToken = default)
    {
        var totalCount = await _ingredientRepository.CountAsync(cancellationToken: cancellationToken);
        var lowStock = await _ingredientRepository.GetLowStockAsync(cancellationToken);

        return new IngredientsSummaryDto
        {
            TotalIngredients = totalCount,
            LowStockCount = lowStock.Count,
            LowStockItems = lowStock.Select(i => new LowStockIngredientDto
            {
                Id = i.Id,
                Name = i.Name,
                CurrentStock = i.StockQuantity,
                MinimumStock = i.MinimumStock,
                UnitOfMeasure = i.UnitOfMeasure.ToString()
            }).ToList()
        };
    }

    public async Task<DailyOperationalSummaryDto> GetDailyOperationalSummaryAsync(DateOnly date,
        CancellationToken cancellationToken = default)
    {
        var attendanceCount = await _attendanceRepository.GetCountByDateAsync(date, cancellationToken);
        var plan = await _planRepository.GetByDateWithPreparationsAsync(date, cancellationToken);

        var summary = new DailyOperationalSummaryDto
        {
            Date = date.ToString("yyyy-MM-dd"),
            TotalAttendees = attendanceCount,
            TotalServingsPlanned = plan?.Preparations.Sum(p => p.EstimatedServings) ?? 0,
            TotalPreparations = plan?.Preparations.Count ?? 0
        };

        if (plan is not null)
        {
            summary.Preparations = plan.Preparations.Select(p => new PreparationSummaryItemDto
            {
                MealName = p.Meal.Name,
                DietType = p.DietType.ToString(),
                EstimatedServings = p.EstimatedServings,
                Status = p.Status.ToString()
            }).ToList();

            // Calcular requerimientos de ingredientes basados en las preparaciones
            var ingredientRequirements = new Dictionary<int, IngredientRequirementDto>();

            foreach (var prep in plan.Preparations)
            {
                if (prep.Meal.MealIngredients is null) continue;
                foreach (var mi in prep.Meal.MealIngredients)
                {
                    var totalQty = mi.QuantityPerServing * prep.EstimatedServings;

                    if (ingredientRequirements.TryGetValue(mi.IngredientId, out var existing))
                    {
                        existing.TotalQuantityRequired += totalQty;
                    }
                    else
                    {
                        ingredientRequirements[mi.IngredientId] = new IngredientRequirementDto
                        {
                            IngredientId = mi.IngredientId,
                            IngredientName = mi.Ingredient?.Name ?? string.Empty,
                            TotalQuantityRequired = totalQty,
                            UnitOfMeasure = mi.UnitOfMeasure.ToString(),
                            CurrentStock = mi.Ingredient?.StockQuantity ?? 0,
                            IsSufficient = (mi.Ingredient?.StockQuantity ?? 0) >= totalQty
                        };
                    }
                }
            }

            summary.IngredientRequirements = ingredientRequirements.Values
                .OrderBy(ir => ir.IngredientName)
                .ToList();
        }

        return summary;
    }
}