export function todayISO(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatTime(dateString: string): string {
  if (!dateString) return '—';
  // Use UTC to avoid timezone shifts if the date string is ISO (which it usually is from backend)
  return new Date(dateString).toLocaleTimeString('es', { 
    hour: '2-digit', 
    minute: '2-digit',
    timeZone: 'UTC'
  });
}

export function formatDate(dateString: string): string {
  if (!dateString) return '—';
  // Use T00:00:00Z to ensure the date is treated as UTC and avoid timezone shifts
  const date = dateString.includes('T') ? new Date(dateString) : new Date(`${dateString}T00:00:00Z`);
  return date.toLocaleDateString('es', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric',
    timeZone: 'UTC'
  });
}
