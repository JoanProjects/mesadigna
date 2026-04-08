using Application.DTOS;
using Application.DTOS.Beneficiary;
using Application.DTOS.Common;
using Application.Services.Interfaces;
using Core.Domain.Entities;
using Core.Domain.Enums;
using Core.Domain.Exception;
using Core.Domain.Interfaces.Repositories;
using Microsoft.Extensions.Logging;

namespace Application.Services;

public class BeneficiaryService : IBeneficiaryService
{
    private readonly IBeneficiaryRepository _beneficiaryRepository;
    private readonly ILogger<BeneficiaryService> _logger;

    public BeneficiaryService(IBeneficiaryRepository beneficiaryRepository, ILogger<BeneficiaryService> logger)
    {
        _beneficiaryRepository = beneficiaryRepository;
        _logger = logger;
    }

    public async Task<BeneficiaryResponseDto> CreateAsync(CreateBeneficiaryRequestDto request,
        CancellationToken cancellationToken = default)
    {
        ValidateIdentityDocumentRequirement(request.DateOfBirth, request.IdentityDocument);

        if (!string.IsNullOrWhiteSpace(request.IdentityDocument))
        {
            var exists = await _beneficiaryRepository.ExistsByIdentityDocumentAsync(request.IdentityDocument,
                cancellationToken: cancellationToken);
            if (exists)
                throw new ConflictException("Ya existe un beneficiario con ese documento de identidad.",
                    "identityDocument");
        }

        var beneficiary = new Beneficiary
        {
            InternalCode = await GenerateInternalCodeAsync(cancellationToken),
            FirstName = request.FirstName.Trim(),
            LastName = request.LastName.Trim(),
            DateOfBirth = request.DateOfBirth,
            Sex = request.Sex,
            IdentityDocument = request.IdentityDocument?.Trim(),
            PhoneNumber = request.PhoneNumber?.Trim(),
            Address = request.Address?.Trim(),
            EmergencyContact = request.EmergencyContact?.Trim(),
            Status = BeneficiaryStatus.Activo,
            Notes = request.Notes?.Trim(),
            RegisteredAt = DateTime.UtcNow
        };

        var created = await _beneficiaryRepository.AddAsync(beneficiary, cancellationToken);
        _logger.LogInformation("Beneficiario creado: {Id} - {FullName}", created.Id, created.FullName);

        return created.ToDto();
    }

    public async Task<BeneficiaryResponseDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        var beneficiary = await _beneficiaryRepository.GetByIdAsync(id, cancellationToken);
        return beneficiary?.ToDto();
    }

    public async Task<PagedResponseDto<BeneficiaryResponseDto>> GetAllPagedAsync(BeneficiaryFilterDto filter,
        CancellationToken cancellationToken = default)
    {
        var pagedResult = await _beneficiaryRepository.GetAllPagedAsync(
            filter.Page, filter.PageSize, filter.Search, filter.Status, cancellationToken);

        var dtoItems = pagedResult.Items.Select(b => b.ToDto()).ToList().AsReadOnly();

        return new PagedResponseDto<BeneficiaryResponseDto>
        {
            Items = dtoItems,
            Page = pagedResult.Page,
            PageSize = pagedResult.PageSize,
            TotalCount = pagedResult.TotalCount,
            TotalPages = pagedResult.TotalPages,
            HasPreviousPage = pagedResult.HasPreviousPage,
            HasNextPage = pagedResult.HasNextPage
        };
    }

    public async Task<BeneficiaryResponseDto?> UpdateAsync(int id, UpdateBeneficiaryRequestDto request,
        CancellationToken cancellationToken = default)
    {
        var beneficiary = await _beneficiaryRepository.GetByIdTrackedAsync(id, cancellationToken);
        if (beneficiary is null) return null;
        ValidateIdentityDocumentRequirement(request.DateOfBirth, request.IdentityDocument);
        if (!string.IsNullOrWhiteSpace(request.IdentityDocument))
        {
            var exists =
                await _beneficiaryRepository.ExistsByIdentityDocumentAsync(request.IdentityDocument, id,
                    cancellationToken);
            if (exists)
                throw new ConflictException("Ya existe otro beneficiario con ese documento de identidad.",
                    "identityDocument");
        }

        beneficiary.FirstName = request.FirstName.Trim();
        beneficiary.LastName = request.LastName.Trim();
        beneficiary.DateOfBirth = request.DateOfBirth;
        beneficiary.Sex = request.Sex;
        beneficiary.IdentityDocument = request.IdentityDocument?.Trim();
        beneficiary.PhoneNumber = request.PhoneNumber?.Trim();
        beneficiary.Address = request.Address?.Trim();
        beneficiary.EmergencyContact = request.EmergencyContact?.Trim();
        beneficiary.Status = request.Status;
        beneficiary.Notes = request.Notes?.Trim();

        await _beneficiaryRepository.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Beneficiario actualizado: {Id}", id);
        return beneficiary.ToDto();
    }

    public async Task<bool> DeactivateAsync(int id, CancellationToken cancellationToken = default)
    {
        var beneficiary = await _beneficiaryRepository.GetByIdTrackedAsync(id, cancellationToken);
        if (beneficiary is null) return false;

        beneficiary.Status = BeneficiaryStatus.Inactivo;
        await _beneficiaryRepository.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Beneficiario desactivado: {Id}", id);
        return true;
    }

    public async Task<bool> ReactivateAsync(int id, CancellationToken cancellationToken = default)
    {
        var beneficiary = await _beneficiaryRepository.GetByIdTrackedAsync(id, cancellationToken);
        if (beneficiary is null) return false;

        beneficiary.Status = BeneficiaryStatus.Activo;
        await _beneficiaryRepository.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Beneficiario reactivado: {Id}", id);
        return true;
    }

    private async Task<string> GenerateInternalCodeAsync(CancellationToken cancellationToken)
    {
        string code;
        do
        {
            var random = Random.Shared.Next(10000, 99999);
            code = $"MD-{random}";
        } while (await _beneficiaryRepository.GetByInternalCodeAsync(code, cancellationToken) is not null);

        return code;
    }

    private static void ValidateIdentityDocumentRequirement(DateTime dateOfBirth, string? identityDocument)
    {
        var age = CalculateAge(dateOfBirth, DateTime.UtcNow.Date);
        if (age >= 18 && string.IsNullOrWhiteSpace(identityDocument))
        {
            throw new InvalidOperationException("El documento de identidad es obligatorio para mayores de edad.");
        }
    }

    private static int CalculateAge(DateTime dateOfBirth, DateTime today)
    {
        var age = today.Year - dateOfBirth.Year;
        if (dateOfBirth.Date > today.AddYears(-age))
        {
            age--;
        }

        return age;
    }
}