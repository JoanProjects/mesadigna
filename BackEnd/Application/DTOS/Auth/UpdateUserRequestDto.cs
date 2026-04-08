using System.ComponentModel.DataAnnotations;
using Core.Domain.Enums;

namespace Application.DTOS.Auth;

public class UpdateUserRequestDto
{
    [Required(ErrorMessage = "El nombre es requerido.")]
    [StringLength(100, MinimumLength = 2)]
    public string FirstName { get; set; } = string.Empty;

    [Required(ErrorMessage = "El apellido es requerido.")]
    [StringLength(100, MinimumLength = 2)]
    public string LastName { get; set; } = string.Empty;

    [Required(ErrorMessage = "El correo es requerido.")]
    [EmailAddress(ErrorMessage = "Formato de correo inválido.")]
    [StringLength(255)]
    public string Email { get; set; } = string.Empty;

    [Required(ErrorMessage = "El rol es requerido.")]
    [EnumDataType(typeof(UserRole))]
    public UserRole Role { get; set; }

    [Phone]
    [StringLength(20)]
    public string? PhoneNumber { get; set; }
}
