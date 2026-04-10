import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWandMagicSparkles, faChartLine } from '@fortawesome/free-solid-svg-icons';
import { usePageTitle } from '@/hooks/usePageTitle';
import { useNotification } from '@/app/providers/NotificationProvider';
import { PageHeader } from '@/components/shared/PageHeader';
import { Loader, Card, Button, EmptyState } from '@/components/ui';
import { predictionService } from '../services/prediction.service';
import { todayISO } from '@/utils/formatDate';
import type { PortionPredictionResponse } from '../types/prediction.types';

export default function PredictionsPage() {
  usePageTitle('Predicciones IA');
  const { success: notify, error: notifyError } = useNotification();
  const [selectedDate, setSelectedDate] = useState(todayISO());
  const [prediction, setPrediction] = useState<PortionPredictionResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  const loadLatest = async (date: string) => {
    setLoading(true);
    try {
      const res = await predictionService.getLatest(date);
      if (res.success && res.data) setPrediction(res.data);
      else setPrediction(null);
    } catch { setPrediction(null); }
    setLoading(false);
  };

  useEffect(() => { loadLatest(selectedDate); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const onDateChange = (date: string) => { setSelectedDate(date); setPrediction(null); loadLatest(date); };

  const generate = async () => {
    setGenerating(true);
    try {
      const res = await predictionService.generate({ targetDate: selectedDate });
      if (res.success && res.data) { setPrediction(res.data); notify('Predicción generada correctamente.'); }
      else notifyError(res.message || 'Error al generar predicción.');
    } catch { notifyError('El servicio de predicciones no está disponible aún.'); }
    finally { setGenerating(false); }
  };

  const getConfidenceColor = (c: number) => {
    if (c >= 0.8) return 'text-primary-600';
    if (c >= 0.5) return 'text-yellow-500';
    return 'text-danger-500';
  };

  return (
    <>
      <PageHeader title="Predicciones IA" subtitle="Estimaciones inteligentes de porciones" />

      <div className="flex flex-wrap gap-3 mb-6 items-center">
        <input type="date" value={selectedDate} onChange={e => onDateChange(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30" />
        <Button onClick={generate} loading={generating}>
          <FontAwesomeIcon icon={faWandMagicSparkles} className="mr-2" />Generar predicción
        </Button>
      </div>

      {loading ? <Loader message="Cargando predicción..." /> : !prediction ? (
        <EmptyState icon={faChartLine} title="Sin predicción" message="No hay predicción disponible para esta fecha. Genere una nueva predicción." />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card title="Resultado de predicción">
            <dl className="space-y-3">
              <div className="flex justify-between"><dt className="text-sm text-text-secondary">Porciones recomendadas</dt><dd className="text-lg font-bold text-text-primary">{prediction.recommendedPortions}</dd></div>
              <div className="flex justify-between"><dt className="text-sm text-text-secondary">Porciones regulares</dt><dd className="text-sm font-semibold">{prediction.regularPortions}</dd></div>
              <div className="flex justify-between"><dt className="text-sm text-text-secondary">Porciones especiales</dt><dd className="text-sm font-semibold">{prediction.specialDietPortions}</dd></div>
              <div className="flex justify-between"><dt className="text-sm text-text-secondary">Confianza del modelo</dt><dd className={`text-sm font-semibold ${getConfidenceColor(prediction.modelConfidence)}`}>{(prediction.modelConfidence * 100).toFixed(1)}%</dd></div>
              <div className="flex justify-between"><dt className="text-sm text-text-secondary">Modelo</dt><dd className="text-sm text-text-secondary">{prediction.modelName} v{prediction.modelVersion}</dd></div>
              {prediction.actualAttendance !== null && (
                <div className="flex justify-between"><dt className="text-sm text-text-secondary">Asistencia real</dt><dd className="text-sm font-semibold">{prediction.actualAttendance}</dd></div>
              )}
            </dl>
          </Card>

          <Card title="Datos de entrada del modelo">
            {prediction.inputSnapshot && (
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between"><dt className="text-text-secondary">Día de la semana</dt><dd>{prediction.inputSnapshot.dayOfWeek}</dd></div>
                <div className="flex justify-between"><dt className="text-text-secondary">Beneficiarios activos</dt><dd>{prediction.inputSnapshot.totalActiveBeneficiaries}</dd></div>
                <div className="flex justify-between"><dt className="text-text-secondary">Adultos mayores</dt><dd>{prediction.inputSnapshot.elderlyCount}</dd></div>
                <div className="flex justify-between"><dt className="text-text-secondary">Menores</dt><dd>{prediction.inputSnapshot.minorsCount}</dd></div>
                <div className="flex justify-between"><dt className="text-text-secondary">Con restricciones</dt><dd>{prediction.inputSnapshot.dietaryRestrictionsCount}</dd></div>
                <div className="flex justify-between"><dt className="text-text-secondary">Hipertensión</dt><dd>{prediction.inputSnapshot.hypertensionCount}</dd></div>
                <div className="flex justify-between"><dt className="text-text-secondary">Diabetes</dt><dd>{prediction.inputSnapshot.diabetesCount}</dd></div>
                <div className="flex justify-between"><dt className="text-text-secondary">Asistencia día anterior</dt><dd>{prediction.inputSnapshot.previousDayAttendance}</dd></div>
                <div className="flex justify-between"><dt className="text-text-secondary">Promedio 7 días</dt><dd>{prediction.inputSnapshot.attendanceLast7DaysAvg.toFixed(1)}</dd></div>
                <div className="flex justify-between"><dt className="text-text-secondary">Promedio 30 días</dt><dd>{prediction.inputSnapshot.attendanceLast30DaysAvg.toFixed(1)}</dd></div>
              </dl>
            )}
          </Card>
        </div>
      )}
    </>
  );
}
