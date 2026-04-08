namespace Application.DTOS.Prediction;

public class EvaluationMetricsDto
{
    public double Mae { get; set; }
    public double Rmse { get; set; }
    public double R2Score { get; set; }
    public int TestSamples { get; set; }
}
