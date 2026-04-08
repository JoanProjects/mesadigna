using System.ComponentModel.DataAnnotations;

namespace Application.DTOS.Auth;

public class LoginRequestDto
{
    [Required(ErrorMessage = "El correo electrónico es requerido.")]
    [EmailAddress(ErrorMessage = "Formato de correo electrónico inválido.")]
    [MaxLength(256)]
    public string Email { get; set; } = string.Empty;

    [Required(ErrorMessage = "La contraseña es requerida.")]
    public string Password { get; set; } = string.Empty;
}
