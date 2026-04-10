using System.ComponentModel.DataAnnotations;
using Core.Domain.Enums;

namespace Application.DTOS.Beneficiary;

public class CreateBeneficiaryRequestDto
{
    [Required(ErrorMessage = "El nombre es requerido.")]
    [StringLength(100, MinimumLength = 2)]
    public string FirstName { get; set; } = string.Empty;

    [Required(ErrorMessage = "El apellido es requerido.")]
    [StringLength(100, MinimumLength = 2)]
    public string LastName { get; set; } = string.Empty;

    [Required(ErrorMessage = "La fecha de nacimiento es requerida.")]
    public DateTime DateOfBirth { get; set; }

    [Required(ErrorMessage = "El sexo es requerido.")]
    [EnumDataType(typeof(Sex))]
    public Sex Sex { get; set; }
    
    [MaxLength(11)]
    [RegularExpression(@"^\d{11}$", ErrorMessage = "La cédula debe tener exactamente 11 dígitos.")]
    public string? IdentityDocument { get; set; }

    [Phone]
    [StringLength(20)]
    public string? PhoneNumber { get; set; }

    [StringLength(300)]
    public string? Address { get; set; }

    [StringLength(200)]
    public string? EmergencyContact { get; set; }

    [StringLength(1000)]
    public string? Notes { get; set; }
}
