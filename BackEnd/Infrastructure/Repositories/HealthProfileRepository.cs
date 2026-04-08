using Core.Domain.Entities;
using Core.Domain.Enums;
using Core.Domain.Interfaces.Repositories;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories;

public class HealthProfileRepository : BaseRepository<HealthProfile>, IHealthProfileRepository
{
    public HealthProfileRepository(ApplicationDbContext context) : base(context)
    {
    }

    public async Task<HealthProfile?> GetByBeneficiaryIdAsync(int beneficiaryId,
        CancellationToken cancellationToken = default)
    {
        return await DbSet
            .AsNoTracking()
            .FirstOrDefaultAsync(hp => hp.BeneficiaryId == beneficiaryId, cancellationToken);
    }

    public async Task<HealthProfile?> GetByBeneficiaryIdTrackedAsync(int beneficiaryId,
        CancellationToken cancellationToken = default)
    {
        return await DbSet
            .FirstOrDefaultAsync(hp => hp.BeneficiaryId == beneficiaryId, cancellationToken);
    }

    public async Task<List<HealthProfile>> GetProfilesWithDietaryConsiderationsAsync(
        CancellationToken cancellationToken = default)
    {
        return await DbSet
            .AsNoTracking()
            .Include(hp => hp.Beneficiary)
            .Where(hp =>
                hp.DietaryRestrictions != null ||
                hp.Allergies != null ||
                hp.HasHypertension ||
                hp.HasDiabetes ||
                hp.SpecialConditions != SpecialCondition.Ninguna)
            .ToListAsync(cancellationToken);
    }

    public async Task<(List<HealthProfile> Items, int TotalCount)> GetProfilesWithDietaryConsiderationsPagedAsync(
        int page, int pageSize, DateOnly? startDate, DateOnly? endDate, string? search,
        CancellationToken cancellationToken = default)
    {
        var query = DbSet
            .AsNoTracking()
            .Include(hp => hp.Beneficiary)
            .Where(hp =>
                hp.DietaryRestrictions != null ||
                hp.Allergies != null ||
                hp.HasHypertension ||
                hp.HasDiabetes ||
                hp.SpecialConditions != SpecialCondition.Ninguna);

        // When date range is provided, filter to beneficiaries who had attendance in that range
        if (startDate.HasValue && endDate.HasValue)
        {
            var beneficiaryIdsInRange = Context.Attendances
                .AsNoTracking()
                .Where(a => a.ServiceDate >= startDate.Value && a.ServiceDate <= endDate.Value)
                .Select(a => a.BeneficiaryId)
                .Distinct();

            query = query.Where(hp => beneficiaryIdsInRange.Contains(hp.BeneficiaryId));
        }

        // Search by name or internal code
        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim().ToLower();
            query = query.Where(hp =>
                hp.Beneficiary.FirstName.ToLower().Contains(term) ||
                hp.Beneficiary.LastName.ToLower().Contains(term) ||
                hp.Beneficiary.InternalCode.ToLower().Contains(term));
        }

        query = query.OrderBy(hp => hp.Beneficiary.LastName).ThenBy(hp => hp.Beneficiary.FirstName);

        var totalCount = await query.CountAsync(cancellationToken);
        var items = await query.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync(cancellationToken);

        return (items, totalCount);
    }
}