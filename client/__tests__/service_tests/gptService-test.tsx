
import {
    inferDuration,
    inferLocation,
    generateMissingDurations,
    generateMissingLocations,
  } from '@/services/gptService';
  
  import googleService from '@/services/GoogleService';
  
  jest.mock('@/services/GoogleService', () => ({
    findPlace: jest.fn(),
  }));
  
  // Mock the global fetch for performToolCall
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () =>
        Promise.resolve({
          output: [
            {
              arguments: JSON.stringify({ duration: 25 }),
            },
          ],
        }),
    })
  ) as jest.Mock;
  
  describe('gptService', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });
  
    test('inferDuration returns estimated duration', async () => {
      const result = await inferDuration('Write a report');
      expect(result).toBe(25);
    });
  
    test('inferLocation returns a location from googleService', async () => {
      const mockLocation = { name: 'Coffee Shop', lat: 123, lng: 456 };
      (googleService.findPlace as jest.Mock).mockResolvedValue(mockLocation);
  
      const result = await inferLocation('Get coffee', [0, 0]); 
      expect(googleService.findPlace).toHaveBeenCalledWith('Get coffee', [0, 0]); 
      expect(result).toEqual(mockLocation);
    });
  
    test('generateMissingDurations fills in missing durations', async () => {
      const tasks = [
        { text: 'Do laundry', duration: null, location: null },
        { text: 'Cook dinner', duration: 45, location: null },
      ];
  
      await generateMissingDurations(tasks as any);
      expect(tasks[0].duration).toBe(25); // From mocked response
      expect(tasks[1].duration).toBe(45); 
    });
  
    test('generateMissingLocations fills in missing locations', async () => {
      const mockLocation = { name: 'Library', lat: 789, lng: 321 };
      (googleService.findPlace as jest.Mock).mockResolvedValue(mockLocation);
  
      const tasks = [
        { text: 'Go to the library', duration: 60, location: null },
        { text: 'Read a book', duration: 30, location: mockLocation },
      ];
  
      await generateMissingLocations(tasks as any, [0, 0]); 
      expect(tasks[0].location).toEqual(mockLocation);
      expect(tasks[1].location).toEqual(mockLocation); 
    });
  });
  