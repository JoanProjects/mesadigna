using Core.Domain.Common;
using Core.Domain.Entities;

namespace Infrastructure.Repositories.Interfaces;

public interface IUserRepository : IBaseRepository<User>
{
    Task<User?> GetByEmailAsync(string email, CancellationToken cancellationToken = default);
    Task<bool> ExistsByEmail(string enail, int? excludeId = null, CancellationToken cancellationToken = default);
    Task<PagedResult<User>> GetAllPagedAsync(int page, int pageSize, bool? isActive = null, CancellationToken cancellationToken = default);
    void UpdateLastLogin(User user);
}
