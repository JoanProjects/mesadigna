import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUsers, faUtensils, faWandMagicSparkles, faEnvelope, faLock, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '@/app/providers/AuthProvider';
import { Alert } from '@/components/ui';
import { ApiError } from '@/services/http/errors';
import { loginSchema } from '../schemas/login.schema';
import { useForm } from '@/hooks/useForm';

const features = [
  { icon: faUsers, title: 'Gestión de beneficiarios', desc: 'Registro y seguimiento de las personas que atiendes' },
  { icon: faUtensils, title: 'Control de cocina', desc: 'Ingredientes, comidas y resumen operativo diario' },
  { icon: faWandMagicSparkles, title: 'Predicciones con IA', desc: 'Estimaciones inteligentes de porciones y dietas' },
];

export default function LoginPage() {
  const { isAuthenticated, login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { values, errors, serverError, setServerError, validate, handleChange } = useForm(loginSchema, {
    email: '',
    password: '',
  });

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard', { replace: true });
  }, [isAuthenticated, navigate]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);
    const valid = await validate();
    if (!valid) return;

    setLoading(true);
    try {
      await login(values);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 401) {
          setServerError('Credenciales inválidas. Verifique su email y contraseña.');
        } else {
          setServerError(err.message);
        }
      } else {
        setServerError('No se pudo conectar con el servidor. Verifique que el backend esté en ejecución.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left panel - branding */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-primary-800 via-primary-600 to-primary-500 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-accent-300 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary-300 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 flex flex-col justify-center px-12 xl:px-16 text-white">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 bg-accent-400/20 rounded-2xl flex items-center justify-center">
              <span className="text-2xl font-bold text-accent-300">MD</span>
            </div>
            <h1 className="text-3xl font-bold">Mesa Digna</h1>
          </div>
          <p className="text-primary-100 text-lg mb-10">Sistema de gestión para comedores comunitarios</p>

          <div className="space-y-6">
            {features.map(f => (
              <div key={f.title} className="flex items-start gap-4">
                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center shrink-0">
                  <FontAwesomeIcon icon={f.icon} className="text-accent-200" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">{f.title}</h3>
                  <p className="text-primary-100/80 text-sm">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel - form */}
      <div className="flex-1 flex items-center justify-center bg-surface-warm px-6 py-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center">
              <span className="text-sm font-bold text-white">MD</span>
            </div>
            <span className="text-2xl font-bold text-primary-600">Mesa Digna</span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-text-primary">Bienvenido de vuelta</h2>
            <p className="text-text-secondary mt-1">Ingresa tus credenciales para acceder</p>
          </div>

          <form onSubmit={onSubmit} className="space-y-5">
            {serverError && <Alert variant="error">{serverError}</Alert>}

            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-sm font-semibold text-text-primary">Correo electrónico</label>
              <div className="relative">
                <FontAwesomeIcon icon={faEnvelope} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-light text-sm" />
                <input
                  type="email"
                  id="email"
                  value={values.email}
                  onChange={handleChange('email')}
                  placeholder="tu@correo.com"
                  disabled={loading}
                  autoComplete="email"
                  className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-lg text-text-primary text-sm placeholder-text-light focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all disabled:opacity-50"
                />
              </div>
              {errors.email && <p className="text-xs text-danger-500 mt-1">{errors.email}</p>}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="password" className="block text-sm font-semibold text-text-primary">Contraseña</label>
              <div className="relative">
                <FontAwesomeIcon icon={faLock} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-light text-sm" />
                <input
                  type="password"
                  id="password"
                  value={values.password}
                  onChange={handleChange('password')}
                  placeholder="Ingresa tu contraseña"
                  disabled={loading}
                  autoComplete="current-password"
                  className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-lg text-text-primary text-sm placeholder-text-light focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all disabled:opacity-50"
                />
              </div>
              {errors.password && <p className="text-xs text-danger-500 mt-1">{errors.password}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 bg-accent-400 hover:bg-accent-500 text-white font-semibold rounded-lg transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Verificando...
                </>
              ) : (
                <>
                  Iniciar sesión
                  <FontAwesomeIcon icon={faArrowRight} className="text-sm" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-xs text-text-light">Mesa Digna &copy; 2025 &mdash; Todos los derechos reservados</p>
          </div>
        </div>
      </div>
    </div>
  );
}
