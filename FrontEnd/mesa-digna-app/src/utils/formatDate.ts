export function todayISO(): string {
  return new Date().toISOString().split('T')[0];
}

export function formatTime(dateString: string): string {
  return new Date(dateString).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' });
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('es', { year: 'numeric', month: 'short', day: 'numeric' });
}
