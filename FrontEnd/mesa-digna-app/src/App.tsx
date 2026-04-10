import { RouterProvider } from 'react-router';
import { AuthProvider } from '@/app/providers/AuthProvider';
import { NotificationProvider } from '@/app/providers/NotificationProvider';
import { router } from '@/app/router';

export default function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <RouterProvider router={router} />
      </NotificationProvider>
    </AuthProvider>
  );
}
