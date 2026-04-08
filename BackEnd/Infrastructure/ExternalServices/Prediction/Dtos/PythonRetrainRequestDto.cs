using Application.DTOS.Prediction;

namespace Infrastructure.ExternalServices.Prediction.Dtos;

public class PythonRetrainRequestDto
{
    public List<TrainingDataPointDto> TrainingData { get; set; } = [];
}
