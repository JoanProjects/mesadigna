using Core.Domain.Common;
using Core.Domain.Entities;
using Infrastructure.Data;
using Infrastructure.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories;

public class UserRepository : BaseRepository<User>, IUserRepository
{
    public UserRepository(ApplicationDbContext context) : base(context)
    {
    }

    public async Task<User?> GetByEmailAsync(string email, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .FirstOrDefaultAsync(u => u.Email == email.ToLower(), cancellationToken);
    }

    public async Task<bool> ExistsByEmail(string enail, int? excludeId = null,
        CancellationToken cancellationToken = default)
    {
        var query = DbSet.Where(u => u.Email == enail);
        if (excludeId.HasValue)
            query = query.Where(u => u.Id != excludeId.Value);
        return await query.AnyAsync(cancellationToken);
    }

    public async Task<PagedResult<User>> GetAllPagedAsync(int page, int pageSize, bool? isActive = null,
        CancellationToken cancellationToken = default)
    {
        return await GetPagedAsync(
            page, pageSize,
            filter: isActive.HasValue ? u => u.IsActive == isActive.Value : null,
            orderBy: u => u.LastName,
            cancellationToken: cancellationToken);
    }

    public void UpdateLastLogin(User user)
    {
        user.LastLoginAt = DateTime.UtcNow;
        DbSet.Update(user);
    }
}