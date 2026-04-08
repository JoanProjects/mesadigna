using System.ComponentModel.DataAnnotations;

namespace Application.DTOS.Common;

public class PaginationRequestDto
{
    private const int MaxPageSize = 50;

    [Range(1, int.MaxValue, ErrorMessage = "La página debe ser mayor a 0.")]
    public int Page { get; set; } = 1;

    private int _pageSize = 10;

    [Range(1, 50, ErrorMessage = "El tamaño de página debe estar entre 1 y 50.")]
    public int PageSize
    {
        get => _pageSize;
        set => _pageSize = value > MaxPageSize ? MaxPageSize : value;
    }
}
