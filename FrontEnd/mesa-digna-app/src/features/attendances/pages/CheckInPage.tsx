import {useRef, useState} from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleCheck } from '@fortawesome/free-solid-svg-icons';
import { useNotification } from '@/app/providers/NotificationProvider';
import { useForm } from '@/hooks/useForm';
import { Input, Select, Textarea, Button, Card, Alert } from '@/components/ui';
import { attendanceService } from '../services/attendance.service';
import { checkInSchema } from '../schemas/checkIn.schema';
import { CHECKIN_METHOD_OPTIONS } from '@/constants/options';
import { ApiError } from '@/services/http/errors';
import { getErrorMessage } from '@/utils/formErrors';
import { formatTime } from '@/utils/formatDate';
import type { AttendanceResponse } from '../types/attendance.types';

export default function CheckInPage() {
  const { success: notify } = useNotification();
  const { values, errors, serverError, setServerError, validate, handleChange, reset } = useForm(checkInSchema, {
    internalCode: '',
    checkInMethod: 'Manual',
    notes: '',
  });
  const [saving, setSaving] = useState(false);
  const [lastCheckIn, setLastCheckIn] = useState<AttendanceResponse | null>(null);

  const submittingRef = useRef(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submittingRef.current) return;
    submittingRef.current = true;
    setServerError(null);
    const valid = await validate();
    if (!valid) {
      submittingRef.current = false;
      return;
    }

    setSaving(true);
    try {
      const res = await attendanceService.checkIn(values);
      if (res.success && res.data) {
        setLastCheckIn(res.data);
        notify(`Check-in exitoso: ${res.data.beneficiaryName}`);
        reset();
      } else {
        setServerError(res.message || 'Error en check-in.');
      }
    } catch (err) {
      setServerError(err instanceof ApiError ? getErrorMessage(err) : 'Error de conexión.');
    } finally {
      setSaving(false);
      submittingRef.current = false;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card title="Registrar asistencia">
        <form onSubmit={onSubmit} className="space-y-4">
          {serverError && <Alert variant="error">{serverError}</Alert>}

          <Input
            label="Código interno del beneficiario"
            value={values.internalCode}
            onChange={handleChange('internalCode')}
            error={errors.internalCode}
            placeholder="Ej: BEN-001"
            autoFocus
          />

          <Select
            label="Método de check-in"
            value={values.checkInMethod}
            onChange={handleChange('checkInMethod')}
            options={CHECKIN_METHOD_OPTIONS}
            error={errors.checkInMethod}
          />

          <Textarea
            label="Notas (opcional)"
            value={values.notes}
            onChange={handleChange('notes')}
            error={errors.notes}
            rows={3}
          />

          <Button type="submit" loading={saving} fullWidth>
            Registrar check-in
          </Button>
        </form>
      </Card>

      {lastCheckIn && (
        <Card title="Último check-in">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center shrink-0">
              <FontAwesomeIcon icon={faCircleCheck} className="text-primary-500 text-xl" />
            </div>
            <div className="space-y-1">
              <p className="text-lg font-semibold text-text-primary">{lastCheckIn.beneficiaryName}</p>
              <p className="text-sm text-text-secondary">Código: <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">{lastCheckIn.beneficiaryInternalCode}</code></p>
              <p className="text-sm text-text-secondary">Hora: {formatTime(lastCheckIn.checkInTime)}</p>
              <p className="text-sm text-text-secondary">Método: {lastCheckIn.checkInMethod}</p>
              {lastCheckIn.notes && <p className="text-sm text-text-light">Notas: {lastCheckIn.notes}</p>}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
