using Core.Domain.Enums;

namespace Application.DTOS.Auth;

public class SetRoleRequestDto
{
    [System.ComponentModel.DataAnnotations.Required]
    [System.ComponentModel.DataAnnotations.EnumDataType(typeof(UserRole))]
    public UserRole Role { get; set; }
}