/**
 * Format date to YYYY-MM-DD format (LOCAL TIME, not UTC)
 */
export function formatDate(date: Date | string): string {
  const d = new Date(date);
  // Use local date, not UTC to avoid timezone issues
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Format date for display (e.g., "Dec 25, 2024")
 */
export function formatDisplayDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
}

/**
 * Format time for display (e.g., "2:30 PM")
 */
export function formatTime(time: string): string {
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
}

/**
 * Get today's date in YYYY-MM-DD format (LOCAL TIME)
 * This fixes the timezone issue!
 */
export function getTodayDate(): string {
  const today = new Date();
  // Force local timezone by using getFullYear, getMonth, getDate
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const todayString = `${year}-${month}-${day}`;
  
  // Debug log to see what's happening
  console.log('🗓️ Today calculation:', {
    rawDate: today,
    formattedToday: todayString,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    utcDate: today.toISOString().split('T')[0],
    localDate: todayString
  });
  
  return todayString;
}

/**
 * Check if a date is today (FIXED LOGIC)
 */
export function isToday(date: string): boolean {
  const today = getTodayDate();
  const result = date === today;
  
  // Debug log
  console.log('📅 isToday check:', {
    inputDate: date,
    todayDate: today,
    isToday: result
  });
  
  return result;
}

/**
 * Check if a date is in the past (FIXED LOGIC)
 */
export function isPastDate(date: string): boolean {
  const today = getTodayDate();
  const result = date < today;
  
  // Debug log
  console.log('⏪ isPastDate check:', {
    inputDate: date,
    todayDate: today,
    isPast: result
  });
  
  return result;
}

/**
 * Check if inventory item is low stock
 */
export function isLowStock(quantity: number, threshold: number = 10): boolean {
  return quantity <= threshold;
}

/**
 * Check if inventory item is near expiry
 */
export function isNearExpiry(expiryDate: string, daysThreshold: number = 30): boolean {
  const expiry = new Date(expiryDate);
  const today = new Date();
  const daysUntilExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  return daysUntilExpiry <= daysThreshold && daysUntilExpiry >= 0;
}

/**
 * Check if inventory item is expired
 */
export function isExpired(expiryDate: string): boolean {
  return new Date(expiryDate) < new Date(getTodayDate());
}

/**
 * Capitalize first letter of each word
 */
export function titleCase(str: string): string {
  return str.replace(/\w\S*/g, (txt) => 
    txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
}

/**
 * Generate next appointment date based on frequency
 */
export function getNextAppointmentDate(currentDate: string, frequency: string): string {
  const date = new Date(currentDate);
  
  switch (frequency.toLowerCase()) {
    case 'weekly':
      date.setDate(date.getDate() + 7);
      break;
    case 'bi-weekly':
      date.setDate(date.getDate() + 14);
      break;
    case 'monthly':
      date.setMonth(date.getMonth() + 1);
      break;
    case 'quarterly':
      date.setMonth(date.getMonth() + 3);
      break;
    case 'bi-annually':
      date.setMonth(date.getMonth() + 6);
      break;
    case 'annually':
      date.setFullYear(date.getFullYear() + 1);
      break;
    default:
      // One-time appointment, no next date
      return '';
  }
  
  return formatDate(date);
}

/**
 * Debounce function for search inputs
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

/**
 * Sanitize input to prevent XSS
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '')
    .trim();
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Generate random ID for temp use
 */
export function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

/**
 * Get current date and time info for debugging
 */
export function getDateDebugInfo(): object {
  const now = new Date();
  return {
    currentTime: now,
    utcDate: now.toISOString().split('T')[0],
    localDate: getTodayDate(),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    offset: now.getTimezoneOffset(),
    timestamp: now.getTime()
  };
}