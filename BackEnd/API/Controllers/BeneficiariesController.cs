using Application.DTOS.Beneficiary;
using Application.DTOS.Common;
using Application.DTOS.HealthProfile;
using Application.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Administrador,Recepcionista,Voluntario")]
public class BeneficiariesController : ControllerBase
{
    private readonly IBeneficiaryService _beneficiaryService;
    private readonly IHealthProfileService _healthProfileService;

    public BeneficiariesController(
        IBeneficiaryService beneficiaryService,
        IHealthProfileService healthProfileService)
    {
        _beneficiaryService = beneficiaryService;
        _healthProfileService = healthProfileService;
    }

    [HttpPost]
    [Authorize(Roles = "Administrador,Recepcionista")]
    [ProducesResponseType(typeof(ApiResponse<BeneficiaryResponseDto>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Create(
        [FromBody] CreateBeneficiaryRequestDto request,
        CancellationToken cancellationToken)
    {
        var created = await _beneficiaryService.CreateAsync(request, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = created.Id },
            ApiResponse<BeneficiaryResponseDto>.Ok(created, "Beneficiario creado exitosamente."));
    }

    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(ApiResponse<BeneficiaryResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(int id, CancellationToken cancellationToken)
    {
        var beneficiary = await _beneficiaryService.GetByIdAsync(id, cancellationToken);
        if (beneficiary is null)
            return NotFound(ApiResponse<object>.Fail("Beneficiario no encontrado."));

        return Ok(ApiResponse<BeneficiaryResponseDto>.Ok(beneficiary));
    }

    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<PagedResponseDto<BeneficiaryResponseDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll(
        [FromQuery] BeneficiaryFilterDto filter,
        CancellationToken cancellationToken)
    {
        var result = await _beneficiaryService.GetAllPagedAsync(filter, cancellationToken);
        return Ok(ApiResponse<PagedResponseDto<BeneficiaryResponseDto>>.Ok(result));
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = "Administrador,Recepcionista")]
    [ProducesResponseType(typeof(ApiResponse<BeneficiaryResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Update(
        int id,
        [FromBody] UpdateBeneficiaryRequestDto request,
        CancellationToken cancellationToken)
    {
        var updated = await _beneficiaryService.UpdateAsync(id, request, cancellationToken);
        if (updated is null)
            return NotFound(ApiResponse<object>.Fail("Beneficiario no encontrado."));

        return Ok(ApiResponse<BeneficiaryResponseDto>.Ok(updated, "Beneficiario actualizado exitosamente."));
    }

    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Administrador,Recepcionista")]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Deactivate(int id, CancellationToken cancellationToken)
    {
        var result = await _beneficiaryService.DeactivateAsync(id, cancellationToken);
        if (!result)
            return NotFound(ApiResponse<object>.Fail("Beneficiario no encontrado."));

        return Ok(ApiResponse<object>.Ok(null!, "Beneficiario desactivado exitosamente."));
    }

    [HttpPatch("{id:int}/reactivate")]
    [Authorize(Roles = "Administrador,Recepcionista")]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Reactivate(int id, CancellationToken cancellationToken)
    {
        var result = await _beneficiaryService.ReactivateAsync(id, cancellationToken);
        if (!result)
            return NotFound(ApiResponse<object>.Fail("Beneficiario no encontrado."));

        return Ok(ApiResponse<object>.Ok(null!, "Beneficiario reactivado exitosamente."));
    }
    
    [HttpGet("{id:int}/health-profile")]
    [ProducesResponseType(typeof(ApiResponse<HealthProfileResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetHealthProfile(int id, CancellationToken cancellationToken)
    {
        var hp = await _healthProfileService.GetByBeneficiaryIdAsync(id, cancellationToken);
        if (hp is null)
            return NotFound(ApiResponse<object>.Fail("Perfil de salud no encontrado para este beneficiario."));

        return Ok(ApiResponse<HealthProfileResponseDto>.Ok(hp));
    }

    [HttpPut("{id:int}/health-profile")]
    [Authorize(Roles = "Administrador,Recepcionista")]
    [ProducesResponseType(typeof(ApiResponse<HealthProfileResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpsertHealthProfile(
        int id,
        [FromBody] UpsertHealthProfileRequestDto request,
        CancellationToken cancellationToken)
    {
        var result = await _healthProfileService.UpsertAsync(id, request, cancellationToken);
        return Ok(ApiResponse<HealthProfileResponseDto>.Ok(result, "Perfil de salud guardado exitosamente."));
    }
}