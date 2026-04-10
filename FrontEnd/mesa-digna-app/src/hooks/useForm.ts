import { useState, useCallback } from 'react';
import type { ObjectSchema, ValidationError } from 'yup';

interface UseFormReturn<T extends Record<string, unknown>> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  serverError: string | null;
  setValue: (field: keyof T, value: unknown) => void;
  setValues: (vals: Partial<T>) => void;
  setErrors: (errs: Partial<Record<keyof T, string>>) => void;
  setServerError: (msg: string | null) => void;
  validate: () => Promise<boolean>;
  reset: (vals?: T) => void;
  handleChange: (field: keyof T) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
}

export function useForm<T extends Record<string, unknown>>(
  schema: ObjectSchema<T>,
  initialValues: T,
): UseFormReturn<T> {
  const [values, setValuesState] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [serverError, setServerError] = useState<string | null>(null);

  const setValue = useCallback((field: keyof T, value: unknown) => {
    setValuesState(prev => ({ ...prev, [field]: value }));
    setErrors(prev => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }, []);

  const setValues = useCallback((vals: Partial<T>) => {
    setValuesState(prev => ({ ...prev, ...vals }));
  }, []);

  const validate = useCallback(async (): Promise<boolean> => {
    try {
      await schema.validate(values, { abortEarly: false });
      setErrors({});
      return true;
    } catch (err) {
      const validationError = err as ValidationError;
      const fieldErrors: Partial<Record<keyof T, string>> = {};
      validationError.inner.forEach(e => {
        if (e.path && !fieldErrors[e.path as keyof T]) {
          fieldErrors[e.path as keyof T] = e.message;
        }
      });
      setErrors(fieldErrors);
      return false;
    }
  }, [schema, values]);

  const reset = useCallback((vals?: T) => {
    setValuesState(vals || initialValues);
    setErrors({});
    setServerError(null);
  }, [initialValues]);

  const handleChange = useCallback((field: keyof T) => {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const target = e.target;
      const value = target.type === 'checkbox' ? (target as HTMLInputElement).checked : target.value;
      setValue(field, value);
    };
  }, [setValue]);

  return { values, errors, serverError, setValue, setValues, setErrors, setServerError, validate, reset, handleChange };
}
