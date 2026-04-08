using Application.DTOS.HealthProfile;

namespace Application.Services.Interfaces;

public interface IHealthProfileService
{
    Task<HealthProfileResponseDto?> GetByBeneficiaryIdAsync(int beneficiaryId,
        CancellationToken cancellationToken = default);

    Task<HealthProfileResponseDto> UpsertAsync(int beneficiaryId, UpsertHealthProfileRequestDto request,
        CancellationToken cancellationToken = default);
}