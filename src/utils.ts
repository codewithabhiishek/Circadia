import { format, parseISO, differenceInMinutes, addDays, startOfDay } from 'date-fns';
import { Nap } from './types';

export function calculateDuration(start: string, end: string): number {
  // Returns duration in minutes
  const startDate = parseISO(start);
  const endDate = parseISO(end);
  let diff = differenceInMinutes(endDate, startDate);
  
  // If end is before start, it means we crossed midnight
  if (diff < 0) {
    diff += 24 * 60; // Add 24 hours
  }
  
  return diff;
}

export function formatDuration(minutes: number): string {
  if (minutes <= 0) return '0h 00m';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h ${m.toString().padStart(2, '0')}m`;
}

export function formatTime(isoString: string): string {
  const date = parseISO(isoString);
  return format(date, 'h:mm a');
}

export function formatDate(dateStr: string): string {
  const date = parseISO(dateStr);
  return format(date, 'EEEE, MMMM d');
}

export function formatDateShort(dateStr: string): string {
  const date = parseISO(dateStr);
  return format(date, 'MMM d');
}

export function getTodayStr(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

export function getDateStr(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

export function buildSleepStartISO(dateStr: string, hours: number, minutes: number): string {
  // Sleep start might be on the previous day (if user sleeps after midnight)
  const date = parseISO(dateStr);
  const sleepDate = new Date(date);
  sleepDate.setHours(hours, minutes, 0, 0);
  
  // If the time is after noon (12:00), it's likely the previous night
  // Actually, we let the user specify - we just use the date as-is
  // The user enters "sleep time" and "wake time" for a given date
  return sleepDate.toISOString();
}

export function buildWakeISO(dateStr: string, hours: number, minutes: number, sleepHours: number): string {
  const date = parseISO(dateStr);
  const wakeDate = new Date(date);
  wakeDate.setHours(hours, minutes, 0, 0);
  
  // If wake time is before sleep time, add a day (crossed midnight)
  const sleepDate = new Date(date);
  sleepDate.setHours(sleepHours, 0, 0, 0);
  
  if (wakeDate <= sleepDate) {
    wakeDate.setDate(wakeDate.getDate() + 1);
  }
  
  return wakeDate.toISOString();
}

export function getNapDuration(nap: Nap): number {
  return calculateDuration(nap.start, nap.end);
}

export function getTotalNapDuration(naps: Nap[]): number {
  return naps.reduce((total, nap) => total + getNapDuration(nap), 0);
}

export function getNightSleepDuration(sleepStart: string, sleepEnd: string): number {
  return calculateDuration(sleepStart, sleepEnd);
}

export function getTotalSleepDuration(sleepStart: string, sleepEnd: string, naps: Nap[]): number {
  return getNightSleepDuration(sleepStart, sleepEnd) + getTotalNapDuration(naps);
}

export function getHoursAndMinutes(isoString: string): { hours: number; minutes: number } {
  const date = parseISO(isoString);
  return { hours: date.getHours(), minutes: date.getMinutes() };
}

export function getDayLabel(dateStr: string): string {
  const date = parseISO(dateStr);
  return format(date, 'EEE');
}

export function generateDatesInRange(days: number): string[] {
  const dates: string[] = [];
  const today = startOfDay(new Date());
  for (let i = days - 1; i >= 0; i--) {
    const d = addDays(today, -i);
    dates.push(getDateStr(d));
  }
  return dates;
}
