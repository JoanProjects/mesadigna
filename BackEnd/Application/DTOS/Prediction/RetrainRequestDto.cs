namespace Application.DTOS.Prediction;

public class RetrainRequestDto
{
    public DateOnly FromDate { get; set; }
    public DateOnly ToDate { get; set; }
}
