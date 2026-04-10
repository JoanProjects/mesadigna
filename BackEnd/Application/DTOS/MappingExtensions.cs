using Application.DTOS.Attendance;
using Application.DTOS.Auth;
using Application.DTOS.Beneficiary;
using Application.DTOS.Common;
using Application.DTOS.HealthProfile;
using Application.DTOS.Ingredient;
using Application.DTOS.Kitchen;
using Application.DTOS.KitchenPlan;
using Application.DTOS.Meal;
using Core.Domain.Common;

namespace Application.DTOS;

public static class MappingExtensions
{
    // ── User ────────────────────────────────────────────────────
    public static UserResponseDto ToDto(this Core.Domain.Entities.User user) => new()
    {
        Id = user.Id,
        FirstName = user.FirstName,
        LastName = user.LastName,
        FullName = user.FullName,
        Email = user.Email,
        Role = user.Role.ToString(),
        PhoneNumber = user.PhoneNumber,
        IsActive = user.IsActive,
        CreatedAt = user.CreatedAt,
        LastLoginAt = user.LastLoginAt
    };

    // ── Beneficiary ─────────────────────────────────────────────
    public static BeneficiaryResponseDto ToDto(this Core.Domain.Entities.Beneficiary beneficiary) => new()
    {
        Id = beneficiary.Id,
        InternalCode = beneficiary.InternalCode,
        FirstName = beneficiary.FirstName,
        LastName = beneficiary.LastName,
        FullName = beneficiary.FullName,
        DateOfBirth = beneficiary.DateOfBirth,
        Age = beneficiary.Age,
        Sex = beneficiary.Sex.ToString(),
        IdentityDocument = beneficiary.IdentityDocument,
        PhoneNumber = beneficiary.PhoneNumber,
        Address = beneficiary.Address,
        EmergencyContact = beneficiary.EmergencyContact,
        Status = beneficiary.Status.ToString(),
        Notes = beneficiary.Notes,
        RegisteredAt = beneficiary.RegisteredAt,
        CreatedAt = beneficiary.CreatedAt
    };

    // ── HealthProfile ───────────────────────────────────────────
    public static HealthProfileResponseDto ToDto(this Core.Domain.Entities.HealthProfile hp) => new()
    {
        Id = hp.Id,
        BeneficiaryId = hp.BeneficiaryId,
        MedicalConditions = hp.MedicalConditions,
        DietaryRestrictions = hp.DietaryRestrictions,
        Allergies = hp.Allergies,
        HasHypertension = hp.HasHypertension,
        HasDiabetes = hp.HasDiabetes,
        SpecialConditions = hp.SpecialConditions.ToString(),
        NutritionalNotes = hp.NutritionalNotes,
        AdditionalNotes = hp.AdditionalNotes,
        HasDietaryConsiderations = hp.HasDietaryConsiderations,
        CreatedAt = hp.CreatedAt,
        UpdatedAt = hp.UpdatedAt
    };

    // ── Attendance ──────────────────────────────────────────────
    public static AttendanceResponseDto ToDto(this Core.Domain.Entities.Attendance attendance) => new()
    {
        Id = attendance.Id,
        BeneficiaryId = attendance.BeneficiaryId,
        BeneficiaryName = attendance.Beneficiary?.FullName ?? string.Empty,
        BeneficiaryInternalCode = attendance.Beneficiary?.InternalCode ?? string.Empty,
        ServiceDate = attendance.ServiceDate.ToString("yyyy-MM-dd"),
        CheckInTime = attendance.CheckInTime,
        CheckInMethod = attendance.CheckInMethod,
        Notes = attendance.Notes
    };

    // ── Kitchen / Dietary ───────────────────────────────────────
    public static DietaryBeneficiaryDto ToDietaryDto(this Core.Domain.Entities.HealthProfile hp) => new()
    {
        BeneficiaryId = hp.BeneficiaryId,
        FullName = hp.Beneficiary?.FullName ?? string.Empty,
        InternalCode = hp.Beneficiary?.InternalCode ?? string.Empty,
        DietaryRestrictions = hp.DietaryRestrictions,
        Allergies = hp.Allergies,
        HasHypertension = hp.HasHypertension,
        HasDiabetes = hp.HasDiabetes,
        SpecialConditions = hp.SpecialConditions.ToString()
    };

    // ── Ingredient ──────────────────────────────────────────────
    public static IngredientResponseDto ToDto(this Core.Domain.Entities.Ingredient ingredient) => new()
    {
        Id = ingredient.Id,
        Name = ingredient.Name,
        Description = ingredient.Description,
        UnitOfMeasure = ingredient.UnitOfMeasure.ToString(),
        StockQuantity = ingredient.StockQuantity,
        MinimumStock = ingredient.MinimumStock,
        IsLowStock = ingredient.IsLowStock,
        CreatedAt = ingredient.CreatedAt,
        IsActive = ingredient.IsActive
    };

    // ── Meal ────────────────────────────────────────────────────
    public static MealResponseDto ToDto(this Core.Domain.Entities.Meal meal) => new()
    {
        Id = meal.Id,
        Name = meal.Name,
        Description = meal.Description,
        MealType = meal.MealType.ToString(),
        BaseServings = meal.BaseServings,
        CreatedAt = meal.CreatedAt,
        Ingredients = meal.MealIngredients?.Select(mi => mi.ToDto()).ToList() ?? []
    };

    public static MealIngredientResponseDto ToDto(this Core.Domain.Entities.MealIngredient mi) => new()
    {
        Id = mi.Id,
        IngredientId = mi.IngredientId,
        IngredientName = mi.Ingredient?.Name ?? string.Empty,
        QuantityPerServing = mi.QuantityPerServing,
        UnitOfMeasure = mi.UnitOfMeasure.ToString()
    };

    public static KitchenPlanResponseDto ToDto(this Core.Domain.Entities.DailyKitchenPlan plan) => new()
    {
        Id = plan.Id,
        PlanDate = plan.PlanDate.ToString("yyyy-MM-dd"),
        MealType = plan.MealType.ToString(),
        EstimatedBeneficiaries = plan.EstimatedBeneficiaries,
        EstimatedServings = plan.EstimatedServings,
        Notes = plan.Notes,
        CreatedAt = plan.CreatedAt,
        Preparations = plan.Preparations?.Select(kp => kp.ToDto()).ToList() ?? []
    };

    public static KitchenPreparationResponseDto ToDto(this Core.Domain.Entities.KitchenPreparation kp) => new()
    {
        Id = kp.Id,
        MealId = kp.MealId,
        MealName = kp.Meal?.Name ?? string.Empty,
        DietType = kp.DietType.ToString(),
        EstimatedServings = kp.EstimatedServings,
        ActualServings = kp.ActualServings,
        Status = kp.Status.ToString(),
        Notes = kp.Notes
    };

    public static PagedResponseDto<T> ToPagedDto<T>(this PagedResult<T> pagedResult) where T : class
        => new()
        {
            Items = pagedResult.Items,
            Page = pagedResult.Page,
            PageSize = pagedResult.PageSize,
            TotalCount = pagedResult.TotalCount,
            TotalPages = pagedResult.TotalPages,
            HasPreviousPage = pagedResult.HasPreviousPage,
            HasNextPage = pagedResult.HasNextPage
        };
}