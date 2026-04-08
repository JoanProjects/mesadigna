using Application.DTOS.Beneficiary;
using Application.DTOS.Common;

namespace Application.Services.Interfaces;

public interface IBeneficiaryService
{
    Task<BeneficiaryResponseDto> CreateAsync(CreateBeneficiaryRequestDto request,
        CancellationToken cancellationToken = default);

    Task<BeneficiaryResponseDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default);

    Task<PagedResponseDto<BeneficiaryResponseDto>> GetAllPagedAsync(BeneficiaryFilterDto filter,
        CancellationToken cancellationToken = default);

    Task<BeneficiaryResponseDto?> UpdateAsync(int id, UpdateBeneficiaryRequestDto request,
        CancellationToken cancellationToken = default);

    Task<bool> DeactivateAsync(int id, CancellationToken cancellationToken = default);
    Task<bool> ReactivateAsync(int id, CancellationToken cancellationToken = default);
}