using Core.Domain.Common;
using Core.Domain.Entities;
using Core.Domain.Enums;
using Infrastructure.Data;
using Infrastructure.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories;

public class BeneficiaryRepository : BaseRepository<Beneficiary>, IBeneficiaryRepository
{
    public BeneficiaryRepository(ApplicationDbContext context) : base(context) { }

    public async Task<Beneficiary?> GetByIdWithHealthProfileAsync(int id, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .AsNoTracking()
            .Include(b => b.HealthProfile)
            .FirstOrDefaultAsync(b => b.Id == id, cancellationToken);
    }

    public async Task<Beneficiary?> GetByInternalCodeAsync(string internalCode, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .AsNoTracking()
            .FirstOrDefaultAsync(b => b.InternalCode == internalCode, cancellationToken);
    }

    public async Task<bool> ExistsByIdentityDocumentAsync(string identityDocument, int? excludeId = null, CancellationToken cancellationToken = default)
    {
        var query = DbSet.Where(b => b.IdentityDocument == identityDocument);
        if (excludeId.HasValue)
            query = query.Where(b => b.Id != excludeId.Value);
        return await query.AnyAsync(cancellationToken);
    }

    public async Task<PagedResult<Beneficiary>> GetAllPagedAsync(
        int page, int pageSize, string? search = null, BeneficiaryStatus? status = null,
        CancellationToken cancellationToken = default)
    {
        var query = DbSet.AsNoTracking().AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var searchLower = search.ToLower();
            query = query.Where(b =>
                b.FirstName.ToLower().Contains(searchLower) ||
                b.LastName.ToLower().Contains(searchLower) ||
                b.InternalCode.ToLower().Contains(searchLower) ||
                (b.IdentityDocument != null && b.IdentityDocument.ToLower().Contains(searchLower)));
        }

        if (status.HasValue)
            query = query.Where(b => b.Status == status.Value);

        query = query.OrderBy(b => b.LastName).ThenBy(b => b.FirstName);

        var totalCount = await query.CountAsync(cancellationToken);

        var items = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return PagedResult<Beneficiary>.Create(items, page, pageSize, totalCount);
    }
}