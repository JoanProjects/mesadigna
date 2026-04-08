using System.ComponentModel.DataAnnotations;
using Core.Domain.Enums;

namespace Application.DTOS.Meal;

public class UpdateMealRequestDto
{
    [Required(ErrorMessage = "El nombre es requerido.")]
    [MaxLength(200)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(500)] public string? Description { get; set; }

    [Required(ErrorMessage = "El tipo de comida es requerido.")]
    public MealType MealType { get; set; }

    [Range(1, int.MaxValue, ErrorMessage = "Las raciones base deben ser al menos 1.")]
    public int BaseServings { get; set; } = 1;
}