import { useNotification } from '@/app/providers/NotificationProvider';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleCheck, faCircleExclamation, faTriangleExclamation, faCircleInfo } from '@fortawesome/free-solid-svg-icons';

const iconMap = {
  success: faCircleCheck,
  error: faCircleExclamation,
  warning: faTriangleExclamation,
  info: faCircleInfo,
};

const colorMap = {
  success: 'bg-success-500',
  error: 'bg-danger-500',
  warning: 'bg-warning-400',
  info: 'bg-primary-400',
};

export function NotificationToast() {
  const { notifications, dismiss } = useNotification();

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-sm">
      {notifications.map(n => (
        <div
          key={n.id}
          className={`${colorMap[n.type]} text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 cursor-pointer`}
          style={{ animation: 'slideIn 0.3s ease-out' }}
          onClick={() => dismiss(n.id)}
        >
          <FontAwesomeIcon icon={iconMap[n.type]} />
          <p className="text-sm font-medium flex-1">{n.message}</p>
        </div>
      ))}
    </div>
  );
}
