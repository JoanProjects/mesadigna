using Application.DTOS;
using Application.DTOS.HealthProfile;
using Application.Services.Interfaces;
using Core.Domain.Entities;
using Core.Domain.Interfaces.Repositories;
using Microsoft.Extensions.Logging;

namespace Application.Services;

public class HealthProfileService : IHealthProfileService
{
    private readonly IHealthProfileRepository _healthProfileRepository;
    private readonly IBeneficiaryRepository _beneficiaryRepository;
    private readonly ILogger<HealthProfileService> _logger;

    public HealthProfileService(
        IHealthProfileRepository healthProfileRepository,
        IBeneficiaryRepository beneficiaryRepository,
        ILogger<HealthProfileService> logger)
    {
        _healthProfileRepository = healthProfileRepository;
        _beneficiaryRepository = beneficiaryRepository;
        _logger = logger;
    }

    public async Task<HealthProfileResponseDto?> GetByBeneficiaryIdAsync(int beneficiaryId,
        CancellationToken cancellationToken = default)
    {
        var hp = await _healthProfileRepository.GetByBeneficiaryIdAsync(beneficiaryId, cancellationToken);
        return hp?.ToDto();
    }

    public async Task<HealthProfileResponseDto> UpsertAsync(int beneficiaryId, UpsertHealthProfileRequestDto request,
        CancellationToken cancellationToken = default)
    {
        var beneficiary = await _beneficiaryRepository.GetByIdAsync(beneficiaryId, cancellationToken);
        if (beneficiary is null)
            throw new KeyNotFoundException($"No se encontró el beneficiario con Id {beneficiaryId}.");

        var existing = await _healthProfileRepository.GetByBeneficiaryIdTrackedAsync(beneficiaryId, cancellationToken);

        if (existing is not null)
        {
            existing.MedicalConditions = request.MedicalConditions?.Trim();
            existing.DietaryRestrictions = request.DietaryRestrictions?.Trim();
            existing.Allergies = request.Allergies?.Trim();
            existing.HasHypertension = request.HasHypertension;
            existing.HasDiabetes = request.HasDiabetes;
            existing.SpecialConditions = request.SpecialConditions;
            existing.NutritionalNotes = request.NutritionalNotes?.Trim();
            existing.AdditionalNotes = request.AdditionalNotes?.Trim();

            await _healthProfileRepository.SaveChangesAsync(cancellationToken);

            _logger.LogInformation("Perfil de salud actualizado para beneficiario: {BeneficiaryId}", beneficiaryId);
            return existing.ToDto();
        }
        else
        {
            var hp = new HealthProfile
            {
                BeneficiaryId = beneficiaryId,
                MedicalConditions = request.MedicalConditions?.Trim(),
                DietaryRestrictions = request.DietaryRestrictions?.Trim(),
                Allergies = request.Allergies?.Trim(),
                HasHypertension = request.HasHypertension,
                HasDiabetes = request.HasDiabetes,
                SpecialConditions = request.SpecialConditions,
                NutritionalNotes = request.NutritionalNotes?.Trim(),
                AdditionalNotes = request.AdditionalNotes?.Trim()
            };

            var created = await _healthProfileRepository.AddAsync(hp, cancellationToken);

            _logger.LogInformation("Perfil de salud creado para beneficiario: {BeneficiaryId}", beneficiaryId);
            return created.ToDto();
        }
    }
}