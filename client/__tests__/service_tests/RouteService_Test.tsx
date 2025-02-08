import RouteService from '@/Services/RouteService';

describe('formatDuration', () => {
  test('should return "Unavailable" when input is null', () => {
    const result = RouteService.formatDuration(null);
    expect(result).toBe('Unavailable');
  });

  test('should return "0 min" for 0 seconds', () => {
    const result = RouteService.formatDuration(0);
    expect(result).toBe('0 min');
  });

  test('should return "1 min" for 60 seconds', () => {
    const result = RouteService.formatDuration(60);
    expect(result).toBe('1 min');
  });

  test('should return "2 min" for 120 seconds', () => {
    const result = RouteService.formatDuration(120);
    expect(result).toBe('2 min');
  });

  test('should return "59 min" for 3540 seconds (59 minutes)', () => {
    const result = RouteService.formatDuration(3540);
    expect(result).toBe('59 min');
  });

  test('should return "1h 0m" for 3600 seconds (1 hour)', () => {
    const result = RouteService.formatDuration(3600);
    expect(result).toBe('1h 0m');
  });

  test('should return "1h 30m" for 5400 seconds (1 hour 30 minutes)', () => {
    const result = RouteService.formatDuration(5400);
    expect(result).toBe('1h 30m');
  });

  test('should return "2h 15m" for 8100 seconds (2 hours 15 minutes)', () => {
    const result = RouteService.formatDuration(8100);
    expect(result).toBe('2h 15m');
  });

  test('should return "3h 0m" for 10800 seconds (3 hours)', () => {
    const result = RouteService.formatDuration(10800);
    expect(result).toBe('3h 0m');
  });
});
