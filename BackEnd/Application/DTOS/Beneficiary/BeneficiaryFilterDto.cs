using Application.DTOS.Common;
using Core.Domain.Enums;

namespace Application.DTOS.Beneficiary;

public class BeneficiaryFilterDto : PaginationRequestDto
{
    public string? Search { get; set; }

    public BeneficiaryStatus? Status { get; set; }
}
