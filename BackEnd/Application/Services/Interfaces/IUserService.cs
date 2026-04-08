using Application.DTOS.Auth;
using Application.DTOS.Common;
using Core.Domain.Enums;

namespace Application.Services.Interfaces;

public interface IUserService
{
    Task<UserResponseDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default);

    Task<PagedResponseDto<UserResponseDto>> GetAllPagedAsync(int page, int pageSize, bool? isActive = null,
        CancellationToken cancellationToken = default);

    Task<UserResponseDto> CreateAsync(CreateUserRequestDto request, CancellationToken cancellationToken = default);

    Task<UserResponseDto> UpdateAsync(int id, UpdateUserRequestDto request,
        CancellationToken cancellationToken = default);

    Task<UserResponseDto> UpdateProfileAsync(int userId, UpdateProfileRequestDto request,
        CancellationToken cancellationToken = default);

    Task ChangePasswordAsync(int userId, ChangePasswordRequestDto request,
        CancellationToken cancellationToken = default);

    Task SetStatusAsync(int id, bool isActive, CancellationToken cancellationToken = default);
    Task SetRoleAsync(int id, UserRole role, CancellationToken cancellationToken = default);
}