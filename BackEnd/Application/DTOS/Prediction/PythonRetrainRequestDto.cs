namespace Application.DTOS.Prediction;

public class PythonRetrainRequestDto
{
    public List<TrainingDataPointDto> TrainingData { get; set; } = [];
}
