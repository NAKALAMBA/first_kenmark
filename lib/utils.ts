import { format, parse, getDay, startOfMonth, endOfMonth, eachDayOfInterval, isSunday } from 'date-fns';

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

/**
 * Calculate expected working hours for a given month
 */
export function getExpectedWorkingHours(year: number, month: number): number {
  const start = startOfMonth(new Date(year, month - 1));
  const end = endOfMonth(new Date(year, month - 1));
  const days = eachDayOfInterval({ start, end });
  
  let totalHours = 0;
  
  days.forEach(day => {
    const dayOfWeek = getDay(day);
    if (dayOfWeek === 0) { // Sunday - off
      return;
    } else if (dayOfWeek === 6) { // Saturday - 4 hours
      totalHours += 4;
    } else { // Monday to Friday - 8.5 hours
      totalHours += 8.5;
    }
  });
  
  return totalHours;
}

/**
 * Calculate worked hours from in-time and out-time
 */
export function calculateWorkedHours(inTime: string | null, outTime: string | null, date: Date): number | null {
  // Handle null, undefined, or empty strings
  if (!inTime || !outTime || inTime.trim() === '' || outTime.trim() === '') {
    return null;
  }
  
  try {
    // Clean time strings (remove spaces, handle various formats)
    const cleanInTime = inTime.trim();
    const cleanOutTime = outTime.trim();
    
    // Validate time format (should be HH:mm)
    if (!/^\d{1,2}:\d{2}$/.test(cleanInTime) || !/^\d{1,2}:\d{2}$/.test(cleanOutTime)) {
      return null;
    }
    
    // Parse time strings (HH:mm format)
    const [inHours, inMinutes] = cleanInTime.split(':').map(Number);
    const [outHours, outMinutes] = cleanOutTime.split(':').map(Number);
    
    // Validate parsed values
    if (isNaN(inHours) || isNaN(inMinutes) || isNaN(outHours) || isNaN(outMinutes)) {
      return null;
    }
    
    // Validate time ranges
    if (inHours < 0 || inHours > 23 || inMinutes < 0 || inMinutes > 59 ||
        outHours < 0 || outHours > 23 || outMinutes < 0 || outMinutes > 59) {
      return null;
    }
    
    // Create date objects with the same date
    const inDateTime = new Date(date);
    inDateTime.setHours(inHours, inMinutes, 0, 0);
    
    const outDateTime = new Date(date);
    outDateTime.setHours(outHours, outMinutes, 0, 0);
    
    // Handle cases where out-time is next day (e.g., night shifts)
    if (outDateTime < inDateTime) {
      outDateTime.setDate(outDateTime.getDate() + 1);
    }
    
    const diffMs = outDateTime.getTime() - inDateTime.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    
    // Validate calculated hours (should be positive and reasonable)
    if (diffHours < 0 || diffHours > 24) {
      return null;
    }
    
    // Round to 2 decimal places
    return Math.round(diffHours * 100) / 100;
  } catch (error) {
    return null;
  }
}

/**
 * Check if a date is a working day
 */
export function isWorkingDay(date: Date): boolean {
  const dayOfWeek = getDay(date);
  return dayOfWeek !== 0; // Sunday is off
}

/**
 * Get working hours for a specific day
 */
export function getWorkingHoursForDay(date: Date): number {
  const dayOfWeek = getDay(date);
  if (dayOfWeek === 0) { // Sunday
    return 0;
  } else if (dayOfWeek === 6) { // Saturday
    return 4;
  } else { // Monday to Friday
    return 8.5;
  }
}

/**
 * Format date to YYYY-MM-DD
 */
export function formatDate(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

/**
 * Parse date string to Date object
 */
export function parseDate(dateString: string): Date {
  return parse(dateString, 'yyyy-MM-dd', new Date());
}

