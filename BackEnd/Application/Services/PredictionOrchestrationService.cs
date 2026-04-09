using System.Text.Json;
using Application.DTOS.Prediction;
using Application.Services.Interfaces;
using Core.Domain.Entities;
using Core.Domain.Enums;
using Core.Domain.Interfaces.Repositories;
using Microsoft.Extensions.Logging;

namespace Application.Services;

public class PredictionOrchestrationService : IPredictionOrchestrationService
{
    private readonly IPredictionService _predictionService;
    private readonly IAttendanceRepository _attendanceRepository;
    private readonly IBeneficiaryRepository _beneficiaryRepository;
    private readonly IHealthProfileRepository _healthProfileRepository;
    private readonly IBaseRepository<PortionPrediction> _predictionRepository;
    private readonly ILogger<PredictionOrchestrationService> _logger;

    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.SnakeCaseLower
    };

    public PredictionOrchestrationService(
        IPredictionService predictionService,
        IAttendanceRepository attendanceRepository,
        IBeneficiaryRepository beneficiaryRepository,
        IHealthProfileRepository healthProfileRepository,
        IBaseRepository<PortionPrediction> predictionRepository,
        ILogger<PredictionOrchestrationService> logger)
    {
        _predictionService = predictionService;
        _attendanceRepository = attendanceRepository;
        _beneficiaryRepository = beneficiaryRepository;
        _healthProfileRepository = healthProfileRepository;
        _predictionRepository = predictionRepository;
        _logger = logger;
    }

    public async Task<PortionPredictionResponseDto> GeneratePredictionAsync(
        DateOnly targetDate,
        CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Generando predicción de porciones para {Date}", targetDate);

        // 1. Recopilar datos del sistema
        var requestDto = await BuildPredictionRequestAsync(targetDate, cancellationToken);

        // 2. Intentar microservicio Python, con fallback heurístico
        var pythonResponse = await _predictionService.GetPortionRecommendationAsync(requestDto, cancellationToken);
        bool usedFallback = pythonResponse.Metadata.ModelName == "HeuristicFallback";

        // 3. Persistir predicción y snapshot
        var prediction = new PortionPrediction
        {
            PredictionDate = targetDate,
            RecommendedPortions = pythonResponse.RecommendedPortions,
            RegularPortions = pythonResponse.RegularPortions,
            SpecialDietPortions = pythonResponse.SpecialDietPortions,
            ModelConfidence = pythonResponse.Confidence,
            ModelName = usedFallback ? "HeuristicFallback" : pythonResponse.Metadata.ModelName,
            ModelVersion = usedFallback ? "fallback-1.0" : pythonResponse.Metadata.ModelVersion,
            GeneratedAt = DateTime.UtcNow,
            DietaryDistributionJson = JsonSerializer.Serialize(pythonResponse.DietaryBreakdown, JsonOptions),
            EvaluationMetricsJson = pythonResponse.EvaluationMetrics is not null
                ? JsonSerializer.Serialize(pythonResponse.EvaluationMetrics, JsonOptions)
                : null,
            FeatureImportancesJson = pythonResponse.Metadata.FeatureImportances.Count > 0
                ? JsonSerializer.Serialize(pythonResponse.Metadata.FeatureImportances, JsonOptions)
                : null,
            InputSnapshot = BuildInputSnapshot(requestDto, targetDate)
        };

        await _predictionRepository.AddAsync(prediction, cancellationToken);

        _logger.LogInformation(
            "Predicción almacenada (Id={Id}): {Portions} porciones, confianza {Confidence}{Fallback}",
            prediction.Id, prediction.RecommendedPortions, prediction.ModelConfidence,
            usedFallback ? " [FALLBACK]" : "");

        return MapToResponseDto(prediction, pythonResponse.DietaryBreakdown);
    }

    public async Task<List<PortionPredictionResponseDto>> GetByDateAsync(
        DateOnly date,
        CancellationToken cancellationToken = default)
    {
        var predictions = await _predictionRepository.FindAsync(
            p => p.PredictionDate == date,
            cancellationToken);

        return predictions.Select(p => MapToResponseDto(p, DeserializeBreakdown(p.DietaryDistributionJson))).ToList();
    }

    public async Task<PortionPredictionResponseDto?> GetLatestByDateAsync(
        DateOnly date,
        CancellationToken cancellationToken = default)
    {
        var predictions = await _predictionRepository.FindAsync(
            p => p.PredictionDate == date,
            cancellationToken);

        var latest = predictions.OrderByDescending(p => p.GeneratedAt).FirstOrDefault();
        return latest is null ? null : MapToResponseDto(latest, DeserializeBreakdown(latest.DietaryDistributionJson));
    }

    public async Task UpdateActualAttendanceAsync(
        DateOnly date,
        int actualAttendance,
        CancellationToken cancellationToken = default)
    {
        var predictions = await _predictionRepository.FindAsync(
            p => p.PredictionDate == date,
            cancellationToken);

        foreach (var prediction in predictions)
        {
            var tracked = await _predictionRepository.GetByIdTrackedAsync(prediction.Id, cancellationToken);
            if (tracked is null) continue;

            tracked.ActualAttendance = actualAttendance;

            // Accuracy = max(0, 1 - |predicted - actual| / actual)
            // Mide qué tan cerca estuvo la predicción del valor real.
            // 1.0 = predicción perfecta, 0.0 = error mayor o igual al 100%.
            if (actualAttendance > 0)
            {
                var error = Math.Abs(tracked.RecommendedPortions - actualAttendance) / (double)actualAttendance;
                tracked.AccuracyScore = Math.Round(Math.Max(0, 1.0 - error), 4);
            }

            _predictionRepository.Update(tracked);
        }

        await _predictionRepository.SaveChangesAsync(cancellationToken);

        _logger.LogInformation(
            "Asistencia real actualizada para {Date}: {Actual} asistentes",
            date, actualAttendance);
    }

    public async Task UpdateActualPortionsAsync(
        DateOnly date,
        int portionsPrepared,
        int? wasted,
        CancellationToken cancellationToken = default)
    {
        var predictions = await _predictionRepository.FindAsync(
            p => p.PredictionDate == date,
            cancellationToken);

        foreach (var prediction in predictions)
        {
            var tracked = await _predictionRepository.GetByIdTrackedAsync(prediction.Id, cancellationToken);
            if (tracked is null) continue;

            tracked.ActualPortionsPrepared = portionsPrepared;
            tracked.WastedPortions = wasted;

            _predictionRepository.Update(tracked);
        }

        await _predictionRepository.SaveChangesAsync(cancellationToken);

        _logger.LogInformation(
            "Porciones reales registradas para {Date}: {Prepared} preparadas, {Wasted} desperdiciadas",
            date, portionsPrepared, wasted ?? 0);
    }

    public async Task<List<AccuracyHistoryItemDto>> GetAccuracyHistoryAsync(
        int days = 30,
        CancellationToken cancellationToken = default)
    {
        var since = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-days));

        var predictions = await _predictionRepository.FindAsync(
            p => p.PredictionDate >= since && p.ActualAttendance != null,
            cancellationToken);

        return predictions
            .OrderByDescending(p => p.PredictionDate)
            .ThenByDescending(p => p.GeneratedAt)
            .Select(p => new AccuracyHistoryItemDto
            {
                PredictionDate = p.PredictionDate.ToString("yyyy-MM-dd"),
                RecommendedPortions = p.RecommendedPortions,
                ActualAttendance = p.ActualAttendance,
                ActualPortionsPrepared = p.ActualPortionsPrepared,
                AccuracyScore = p.AccuracyScore,
                ModelVersion = p.ModelVersion
            })
            .ToList();
    }

    public async Task<ModelInfoResponseDto> GetModelInfoAsync(CancellationToken cancellationToken = default)
    {
        return await _predictionService.GetModelInfoAsync(cancellationToken);
    }

    public async Task<RetrainResponseDto> TriggerRetrainAsync(
        DateOnly fromDate,
        DateOnly toDate,
        CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Preparando reentrenamiento con datos desde {From} hasta {To}", fromDate, toDate);

        // Recopilar predicciones que tienen asistencia real registrada
        var predictions = await _predictionRepository.FindAsync(
            p => p.PredictionDate >= fromDate
                 && p.PredictionDate <= toDate
                 && p.ActualAttendance != null,
            cancellationToken);

        if (predictions.Count < 30)
        {
            throw new InvalidOperationException(
                $"Se necesitan al menos 30 predicciones con asistencia real para reentrenar. " +
                $"Encontradas: {predictions.Count}. Registre más asistencia real antes de reentrenar.");
        }

        // Construir datos de entrenamiento desde predicciones con snapshots
        var trainingData = new List<TrainingDataPointDto>();

        foreach (var p in predictions)
        {
            var snapshot = p.InputSnapshot;
            if (snapshot is null) continue;

            var dayOfWeek = snapshot.DayOfWeek;
            var avg7 = snapshot.AttendanceLast7DaysAvg;
            var avg30 = snapshot.AttendanceLast30DaysAvg;
            var total = Math.Max(snapshot.TotalActiveBeneficiaries, 1);

            trainingData.Add(new TrainingDataPointDto
            {
                Date = p.PredictionDate.ToString("yyyy-MM-dd"),
                DayOfWeek = dayOfWeek,
                TotalBeneficiaries = snapshot.TotalActiveBeneficiaries,
                ElderlyCount = snapshot.ElderlyCount,
                MinorsCount = snapshot.MinorsCount,
                DietaryRestrictionsCount = snapshot.DietaryRestrictionsCount,
                HypertensionCount = snapshot.HypertensionCount,
                DiabetesCount = snapshot.DiabetesCount,
                PreviousDayAttendance = snapshot.PreviousDayAttendance,
                AttendanceLast7DaysAvg = avg7,
                AttendanceLast30DaysAvg = avg30,
                IsWeekend = dayOfWeek >= 5 ? 1 : 0,
                AttendanceTrend = Math.Round(avg7 - avg30, 2),
                BeneficiaryAttendanceRatio = Math.Round(avg30 / total, 4),
                ActualAttendance = p.ActualAttendance!.Value
            });
        }

        if (trainingData.Count < 30)
        {
            throw new InvalidOperationException(
                $"Solo {trainingData.Count} predicciones tienen snapshot de entrada. " +
                $"Se necesitan al menos 30 para reentrenar.");
        }

        // Enviar al microservicio Python
        var retrainRequest = new PythonRetrainRequestDto { TrainingData = trainingData };
        var result = await _predictionService.RetrainModelAsync(retrainRequest, cancellationToken);

        _logger.LogInformation(
            "Modelo reentrenado exitosamente: {Samples} muestras, MAE={Mae}, R²={R2}",
            result.TrainingSamples, result.EvaluationMetrics.Mae, result.EvaluationMetrics.R2Score);

        return new RetrainResponseDto
        {
            ModelVersion = result.ModelVersion,
            TrainingSamples = result.TrainingSamples,
            EvaluationMetrics = result.EvaluationMetrics,
            FeatureImportances = result.FeatureImportances,
            LastTrainedAt = result.LastTrainedAt
        };
    }

    // ── Métodos privados ──────────────────────────────────────

    private async Task<PythonPredictionRequestDto> BuildPredictionRequestAsync(
        DateOnly targetDate,
        CancellationToken cancellationToken)
    {
        // Beneficiarios activos
        var activeBeneficiaries = await _beneficiaryRepository.CountAsync(
            b => b.Status == BeneficiaryStatus.Activo, cancellationToken);

        // Perfiles de salud con restricciones
        var allProfiles = await _healthProfileRepository.GetAllAsync(cancellationToken);

        int hypertensionCount = allProfiles.Count(p => p.HasHypertension);
        int diabetesCount = allProfiles.Count(p => p.HasDiabetes);
        int allergiesCount = allProfiles.Count(p => !string.IsNullOrWhiteSpace(p.Allergies));
        int dietaryRestrictionsCount = allProfiles.Count(p => !string.IsNullOrWhiteSpace(p.DietaryRestrictions));

        // Distribución por edad (de beneficiarios activos)
        var allBeneficiaries = await _beneficiaryRepository.FindAsync(
            b => b.Status == BeneficiaryStatus.Activo, cancellationToken);

        int elderlyCount = allBeneficiaries.Count(b => b.Age >= 65);
        int minorsCount = allBeneficiaries.Count(b => b.Age < 18);
        int adultsCount = allBeneficiaries.Count(b => b.Age >= 18 && b.Age < 65);

        // Historial de asistencia (últimos 30 días)
        var today = targetDate;
        var thirtyDaysAgo = today.AddDays(-30);
        var sevenDaysAgo = today.AddDays(-7);
        var yesterday = today.AddDays(-1);

        var recentAttendances = await _attendanceRepository.GetByDateRangeAsync(
            thirtyDaysAgo, yesterday, cancellationToken);

        var attendanceByDate = recentAttendances
            .GroupBy(a => a.ServiceDate)
            .ToDictionary(g => g.Key, g => g.Count());

        var history = attendanceByDate
            .OrderByDescending(kv => kv.Key)
            .Select(kv => new AttendanceHistoryItemDto
            {
                Date = kv.Key.ToString("yyyy-MM-dd"),
                Count = kv.Value
            })
            .ToList();

        int prevDayAttendance = attendanceByDate.GetValueOrDefault(yesterday, 0);

        double avg7 = attendanceByDate
            .Where(kv => kv.Key >= sevenDaysAgo)
            .Select(kv => (double)kv.Value)
            .DefaultIfEmpty(0)
            .Average();

        double avg30 = attendanceByDate.Values
            .Select(v => (double)v)
            .DefaultIfEmpty(0)
            .Average();

        return new PythonPredictionRequestDto
        {
            TargetDate = targetDate.ToString("yyyy-MM-dd"),
            TotalActiveBeneficiaries = activeBeneficiaries,
            DietaryDistribution = new DietaryDistributionDto
            {
                HypertensionCount = hypertensionCount,
                DiabetesCount = diabetesCount,
                AllergiesCount = allergiesCount,
                DietaryRestrictionsCount = dietaryRestrictionsCount
            },
            AgeDistribution = new AgeDistributionDto
            {
                MinorsCount = minorsCount,
                ElderlyCount = elderlyCount,
                AdultsCount = adultsCount
            },
            AttendanceHistory = history,
            PreviousDayAttendance = prevDayAttendance,
            AttendanceLast7DaysAvg = Math.Round(avg7, 1),
            AttendanceLast30DaysAvg = Math.Round(avg30, 1)
        };
    }
    
    private static PredictionInputSnapshot BuildInputSnapshot(
        PythonPredictionRequestDto request,
        DateOnly targetDate)
    {
        return new PredictionInputSnapshot
        {
            DayOfWeek = (int)targetDate.DayOfWeek,
            TotalActiveBeneficiaries = request.TotalActiveBeneficiaries,
            ElderlyCount = request.AgeDistribution.ElderlyCount,
            MinorsCount = request.AgeDistribution.MinorsCount,
            DietaryRestrictionsCount = request.DietaryDistribution.DietaryRestrictionsCount
                                      + request.DietaryDistribution.AllergiesCount,
            HypertensionCount = request.DietaryDistribution.HypertensionCount,
            DiabetesCount = request.DietaryDistribution.DiabetesCount,
            PreviousDayAttendance = request.PreviousDayAttendance,
            AttendanceLast7DaysAvg = request.AttendanceLast7DaysAvg,
            AttendanceLast30DaysAvg = request.AttendanceLast30DaysAvg,
            RawInputJson = JsonSerializer.Serialize(request, JsonOptions)
        };
    }

    private static PortionPredictionResponseDto MapToResponseDto(
        PortionPrediction prediction,
        DietaryBreakdownDto? breakdown)
    {
        var dto = new PortionPredictionResponseDto
        {
            Id = prediction.Id,
            PredictionDate = prediction.PredictionDate.ToString("yyyy-MM-dd"),
            RecommendedPortions = prediction.RecommendedPortions,
            RegularPortions = prediction.RegularPortions,
            SpecialDietPortions = prediction.SpecialDietPortions,
            ModelConfidence = prediction.ModelConfidence,
            ModelName = prediction.ModelName,
            ModelVersion = prediction.ModelVersion,
            GeneratedAt = prediction.GeneratedAt,
            DietaryBreakdown = breakdown,
            ActualAttendance = prediction.ActualAttendance,
            AccuracyScore = prediction.AccuracyScore,
            ActualPortionsPrepared = prediction.ActualPortionsPrepared,
            WastedPortions = prediction.WastedPortions
        };

        if (prediction.InputSnapshot is not null)
        {
            dto.InputSnapshot = new PredictionInputSnapshotDto
            {
                DayOfWeek = prediction.InputSnapshot.DayOfWeek,
                TotalActiveBeneficiaries = prediction.InputSnapshot.TotalActiveBeneficiaries,
                ElderlyCount = prediction.InputSnapshot.ElderlyCount,
                MinorsCount = prediction.InputSnapshot.MinorsCount,
                DietaryRestrictionsCount = prediction.InputSnapshot.DietaryRestrictionsCount,
                HypertensionCount = prediction.InputSnapshot.HypertensionCount,
                DiabetesCount = prediction.InputSnapshot.DiabetesCount,
                PreviousDayAttendance = prediction.InputSnapshot.PreviousDayAttendance,
                AttendanceLast7DaysAvg = prediction.InputSnapshot.AttendanceLast7DaysAvg,
                AttendanceLast30DaysAvg = prediction.InputSnapshot.AttendanceLast30DaysAvg
            };
        }

        return dto;
    }

    private static DietaryBreakdownDto? DeserializeBreakdown(string? json)
    {
        if (string.IsNullOrWhiteSpace(json)) return null;
        try
        {
            return JsonSerializer.Deserialize<DietaryBreakdownDto>(json, JsonOptions);
        }
        catch
        {
            return null;
        }
    }
}
