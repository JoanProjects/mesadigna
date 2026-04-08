using Application.DTOS;
using Application.DTOS.Auth;
using Application.DTOS.Common;
using Application.Services.Interfaces;
using Core.Domain.Entities;
using Core.Domain.Enums;
using Core.Domain.Exception;
using Core.Domain.Interfaces.Repositories;

namespace Application.Services;

public class UserService : IUserService
{
    private readonly IUserRepository _userRepository;

    public UserService(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    public async Task<UserResponseDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        var user = await _userRepository.GetByIdAsync(id, cancellationToken);
        return user?.ToDto();
    }

    public async Task<PagedResponseDto<UserResponseDto>> GetAllPagedAsync(
        int page, int pageSize, bool? isActive = null, CancellationToken cancellationToken = default)
    {
        var pagedUsers = await _userRepository.GetAllPagedAsync(page, pageSize, isActive, cancellationToken);

        var dtoItems = pagedUsers.Items.Select(u => u.ToDto()).ToList().AsReadOnly();

        return new PagedResponseDto<UserResponseDto>
        {
            Items = dtoItems,
            Page = pagedUsers.Page,
            PageSize = pagedUsers.PageSize,
            TotalCount = pagedUsers.TotalCount,
            TotalPages = pagedUsers.TotalPages,
            HasPreviousPage = pagedUsers.HasPreviousPage,
            HasNextPage = pagedUsers.HasNextPage
        };
    }

    public async Task<UserResponseDto> CreateAsync(CreateUserRequestDto request,
        CancellationToken cancellationToken = default)
    {
        var existsByEmail = await _userRepository.ExistsByEmail(request.Email, cancellationToken: cancellationToken);
        if (existsByEmail)
            throw new ConflictException("Ya existe un usuario con ese correo electrónico.", "email");

        var user = new User
        {
            FirstName = request.FirstName,
            LastName = request.LastName,
            Email = request.Email.ToLower(),
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            Role = request.Role,
            PhoneNumber = request.PhoneNumber
        };

        var createdUser = await _userRepository.AddAsync(user, cancellationToken);

        return createdUser.ToDto();
    }

    public async Task<UserResponseDto> UpdateAsync(int id, UpdateUserRequestDto request,
        CancellationToken cancellationToken = default)
    {
        var user = await _userRepository.GetByIdTrackedAsync(id, cancellationToken);
        if (user is null)
            throw new KeyNotFoundException("Usuario no encontrado.");

        var emailTaken =
            await _userRepository.ExistsByEmail(request.Email, excludeId: id, cancellationToken: cancellationToken);
        if (emailTaken)
            throw new ConflictException("Ya existe un usuario con ese correo electrónico.", "email");

        user.FirstName = request.FirstName;
        user.LastName = request.LastName;
        user.Email = request.Email.ToLower();
        user.Role = request.Role;
        user.PhoneNumber = request.PhoneNumber;
        user.UpdatedAt = DateTime.UtcNow;

        await _userRepository.SaveChangesAsync(cancellationToken);

        return user.ToDto();
    }

    public async Task<UserResponseDto> UpdateProfileAsync(int userId, UpdateProfileRequestDto request,
        CancellationToken cancellationToken = default)
    {
        var user = await _userRepository.GetByIdTrackedAsync(userId, cancellationToken);
        if (user is null)
            throw new KeyNotFoundException("Usuario no encontrado.");

        var emailTaken =
            await _userRepository.ExistsByEmail(request.Email, excludeId: userId, cancellationToken: cancellationToken);
        if (emailTaken)
            throw new ConflictException("Ya existe un usuario con ese correo electrónico.", "email");

        user.FirstName = request.FirstName;
        user.LastName = request.LastName;
        user.Email = request.Email.ToLower();
        user.PhoneNumber = request.PhoneNumber;
        user.UpdatedAt = DateTime.UtcNow;

        await _userRepository.SaveChangesAsync(cancellationToken);

        return user.ToDto();
    }

    public async Task ChangePasswordAsync(int userId, ChangePasswordRequestDto request,
        CancellationToken cancellationToken = default)
    {
        var user = await _userRepository.GetByIdTrackedAsync(userId, cancellationToken);
        if (user is null)
            throw new KeyNotFoundException("Usuario no encontrado.");

        var isValid = BCrypt.Net.BCrypt.Verify(request.CurrentPassword, user.PasswordHash);
        if (!isValid)
            throw new InvalidOperationException("La contraseña actual es incorrecta.");

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
        user.UpdatedAt = DateTime.UtcNow;

        await _userRepository.SaveChangesAsync(cancellationToken);
    }

    public async Task SetStatusAsync(int id, bool isActive, CancellationToken cancellationToken = default)
    {
        var user = await _userRepository.GetByIdTrackedAsync(id, cancellationToken);
        if (user is null)
            throw new KeyNotFoundException("Usuario no encontrado.");

        user.IsActive = isActive;
        user.UpdatedAt = DateTime.UtcNow;

        await _userRepository.SaveChangesAsync(cancellationToken);
    }

    public async Task SetRoleAsync(int id, UserRole role, CancellationToken cancellationToken = default)
    {
        var user = await _userRepository.GetByIdTrackedAsync(id, cancellationToken);
        if (user is null)
            throw new KeyNotFoundException("Usuario no encontrado.");

        user.Role = role;
        user.UpdatedAt = DateTime.UtcNow;

        await _userRepository.SaveChangesAsync(cancellationToken);
    }
}