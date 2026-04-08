using System.ComponentModel.DataAnnotations;
using Core.Domain.Enums;

namespace Application.DTOS.Ingredient;

public class CreateIngredientRequestDto
{
    [Required(ErrorMessage = "El nombre es requerido.")]
    [MaxLength(150)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(500)]
    public string? Description { get; set; }

    [Required(ErrorMessage = "La unidad de medida es requerida.")]
    public UnitOfMeasure UnitOfMeasure { get; set; }

    [Range(0, double.MaxValue, ErrorMessage = "El stock debe ser mayor o igual a 0.")]
    public decimal StockQuantity { get; set; }

    [Range(0, double.MaxValue, ErrorMessage = "El stock mínimo debe ser mayor o igual a 0.")]
    public decimal MinimumStock { get; set; }
}
