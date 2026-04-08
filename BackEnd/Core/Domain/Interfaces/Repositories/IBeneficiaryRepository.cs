using Core.Domain.Common;
using Core.Domain.Entities;
using Core.Domain.Enums;

namespace Core.Domain.Interfaces.Repositories;

public interface IBeneficiaryRepository : IBaseRepository<Beneficiary>
{
    Task<Beneficiary?> GetByIdWithHealthProfileAsync(int id, CancellationToken cancellationToken = default);
    Task<Beneficiary?> GetByInternalCodeAsync(string internalCode, CancellationToken cancellationToken = default);
    Task<bool> ExistsByIdentityDocumentAsync(string identityDocument, int? excludeId = null, CancellationToken cancellationToken = default);
    Task<PagedResult<Beneficiary>> GetAllPagedAsync(int page, int pageSize, string? search = null, BeneficiaryStatus? status = null, CancellationToken cancellationToken = default);
}
