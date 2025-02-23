import ShuttleCalculatorService from '../../services/ShuttleCalculatorService';

describe('getNextDepartureTime', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should return correct time until next departure for SGW', () => {
    const result = ShuttleCalculatorService.getNextDepartureTime('Monday-Thursday', '09:20', 'SGW');
    expect(result).toBe('10m');
  });

  test('should return correct time until next departure for LOYOLA', () => {
    const result = ShuttleCalculatorService.getNextDepartureTime('Monday-Thursday', '13:10', 'LOY');
    expect(result).toBe('5m');
  });

  test('should return 11h 30m', () => {
    const result = ShuttleCalculatorService.getNextDepartureTime('Monday-Thursday', '19:00', 'SGW');
    expect(result).toBe('11h 30m');
  });

  test('should return "Invalid day" for an invalid day', () => {
    const result = ShuttleCalculatorService.getNextDepartureTime('Sunday', '10:00', 'SGW');
    expect(result).toBe('Invalid day');
  });

  test('should return "Invalid campus" for an invalid campus', () => {
    const result = ShuttleCalculatorService.getNextDepartureTime(
      'Monday-Thursday',
      '10:00',
      'XYZ' as 'LOY' | 'SGW'
    );
    expect(result).toBe('Invalid campus');
  });

  test('should return "0m" when the shuttle is leaving at the same time', () => {
    const result = ShuttleCalculatorService.getNextDepartureTime('Monday-Thursday', '12:30', 'SGW');
    expect(result).toBe('0m');
  });

  test('should return correct time for Friday schedule', () => {
    const result = ShuttleCalculatorService.getNextDepartureTime('Friday', '15:00', 'LOY');
    expect(result).toBe('15m');
  });

  test('should return 12h 0m if exactly at last shuttle', () => {
    const result = ShuttleCalculatorService.getNextDepartureTime('Monday-Thursday', '18:30', 'SGW');
    expect(result).toBe('12h 0m');
  });

  test('should return correct wait time when shuttle is later in the afternoon', () => {
    const result = ShuttleCalculatorService.getNextDepartureTime('Monday-Thursday', '14:20', 'LOY');
    expect(result).toBe('10m');
  });
});

describe('convertToMinutes', () => {
  test('should correctly convert AM time to minutes', () => {
    const result = (ShuttleCalculatorService as any).convertToMinutes('09:30');
    expect(result).toBe(570);
  });

  test('should correctly convert PM time to minutes', () => {
    const result = (ShuttleCalculatorService as any).convertToMinutes('18:30');
    expect(result).toBe(1110);
  });

  test('should correctly convert PM time', () => {
    const result = (ShuttleCalculatorService as any).convertToMinutes('18:45');
    expect(result).toBe(1125);
  });

  test('should correctly handle midnight time (00:00)', () => {
    const result = (ShuttleCalculatorService as any).convertToMinutes('00:00');
    expect(result).toBe(0);
  });

  test('should correctly handle noon time (12:00)', () => {
    const result = (ShuttleCalculatorService as any).convertToMinutes('12:00');
    expect(result).toBe(720);
  });
});

describe('formatTimeDifference', () => {
  test('should correctly format minutes only', () => {
    const result = (ShuttleCalculatorService as any).formatTimeDifference(600, 630);
    expect(result).toBe('30m');
  });

  test('should correctly format hours and minutes', () => {
    const result = (ShuttleCalculatorService as any).formatTimeDifference(600, 750);
    expect(result).toBe('2h 30m');
  });

  test('should correctly format exactly 1 hour', () => {
    const result = (ShuttleCalculatorService as any).formatTimeDifference(600, 660);
    expect(result).toBe('1h 0m');
  });

  test('should correctly format exactly 2h 0m', () => {
    const result = (ShuttleCalculatorService as any).formatTimeDifference(600, 720);
    expect(result).toBe('2h 0m');
  });

  test('should correctly format time when no difference (0 minutes)', () => {
    const result = (ShuttleCalculatorService as any).formatTimeDifference(600, 600);
    expect(result).toBe('0m');
  });
});
