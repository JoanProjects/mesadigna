using System.ComponentModel.DataAnnotations;
using Core.Domain.Enums;

namespace Application.DTOS.Kitchen;

public class AddMealIngredientRequestDto
{
    [Required]
    public int IngredientId { get; set; }

    [Required]
    [Range(0.0001, double.MaxValue, ErrorMessage = "La cantidad por ración debe ser mayor que 0.")]
    public decimal QuantityPerServing { get; set; }

    [Required]
    public UnitOfMeasure UnitOfMeasure { get; set; }
}
