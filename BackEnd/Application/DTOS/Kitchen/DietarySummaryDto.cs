using Application.DTOS.Common;

namespace Application.DTOS.Kitchen;

public class DietarySummaryDto
{
    public int TotalBeneficiariesWithRestrictions { get; set; }
    public PagedResponseDto<DietaryBeneficiaryDto> Beneficiaries { get; set; } = new();
}
