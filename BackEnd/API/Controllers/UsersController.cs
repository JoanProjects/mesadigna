using Application.DTOS.Auth;
using Application.DTOS.Common;
using Application.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Administrador")]
public class UsersController : ControllerBase
{
    private readonly IUserService _userService;

    public UsersController(IUserService userService)
    {
        _userService = userService;
    }
    
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<PagedResponseDto<UserResponseDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll(
        [FromQuery] PaginationRequestDto pagination,
        [FromQuery] bool? isActive,
        CancellationToken cancellationToken)
    {
        var result = await _userService.GetAllPagedAsync(
            pagination.Page, pagination.PageSize, isActive, cancellationToken);

        return Ok(ApiResponse<PagedResponseDto<UserResponseDto>>.Ok(result));
    }
    
    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(ApiResponse<UserResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(int id, CancellationToken cancellationToken)
    {
        var user = await _userService.GetByIdAsync(id, cancellationToken);

        if (user is null)
            return NotFound(ApiResponse<object>.Fail("Usuario no encontrado."));

        return Ok(ApiResponse<UserResponseDto>.Ok(user));
    }
    
    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<UserResponseDto>), StatusCodes.Status201Created)]
    public async Task<IActionResult> Create(
        [FromBody] CreateUserRequestDto request,
        CancellationToken cancellationToken)
    {
        var createdUser = await _userService.CreateAsync(request, cancellationToken);

        return CreatedAtAction(nameof(GetById), new { id = createdUser.Id },
            ApiResponse<UserResponseDto>.Ok(createdUser, "Usuario creado exitosamente."));
    }
    
    [HttpPut("{id:int}")]
    [ProducesResponseType(typeof(ApiResponse<UserResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Update(
        int id,
        [FromBody] UpdateUserRequestDto request,
        CancellationToken cancellationToken)
    {
        var updatedUser = await _userService.UpdateAsync(id, request, cancellationToken);

        return Ok(ApiResponse<UserResponseDto>.Ok(updatedUser, "Usuario actualizado exitosamente."));
    }
    
    [HttpPatch("{id:int}/status")]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> SetStatus(
        int id,
        [FromBody] SetStatusRequestDto request,
        CancellationToken cancellationToken)
    {
        await _userService.SetStatusAsync(id, request.IsActive, cancellationToken);

        var message = request.IsActive ? "Usuario activado." : "Usuario desactivado.";
        return Ok(ApiResponse<object>.Ok(new { }, message));
    }
    
    [HttpPatch("{id:int}/role")]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> SetRole(
        int id,
        [FromBody] SetRoleRequestDto request,
        CancellationToken cancellationToken)
    {
        await _userService.SetRoleAsync(id, request.Role, cancellationToken);

        return Ok(ApiResponse<object>.Ok(new { }, "Rol actualizado exitosamente."));
    }
}