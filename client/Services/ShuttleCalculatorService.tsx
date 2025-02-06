import ShuttleSchedule from '@/constants/ShuttleSchedule';

class ShuttleCalculatorService {
  static getNextDepartureTime(day: string, currentTime: string, campus: 'LOY' | 'SGW'): string {
    const schedule = ShuttleSchedule.schedule[day];
    if (!schedule) {
      return 'Invalid day';
    }

    const departures = schedule[campus];
    if (!departures) {
      return 'Invalid campus';
    }

    const currentMinutes = this.convertToMinutes(currentTime);

    for (const departure of departures) {
      const departureMinutes = this.convertToMinutes(departure);
      if (departureMinutes >= currentMinutes) {
        return this.formatTimeDifference(currentMinutes, departureMinutes);
      }
    }
    return 'No more departures today';
  }

  private static convertToMinutes(time: string): number {
    const isPM = time.includes('*');
    time = time.replace('*', '');
    const [hours, minutes] = time.split(':').map(Number);
    return (isPM ? 12 * 60 : 0) + hours * 60 + minutes;
  }

  private static formatTimeDifference(current: number, next: number): string {
    const diff = next - current;
    const hours = Math.floor(diff / 60);
    const minutes = diff % 60;
    return `${hours > 0 ? hours + 'h ' : ''}${minutes}m`;
  }
  static getCurrentTime(): string {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }
}
export default ShuttleCalculatorService;
