import {
  inferDuration,
  inferLocation,
  generateMissingDurations,
  generateMissingLocations,
  performToolCall,
  OPENAI_TOOLS,
} from '@/services/gptService';

import googleService from '@/services/GoogleService';

jest.mock('@/services/GoogleService', () => ({
  findPlace: jest.fn(),
}));

describe('gptService', () => {
  // Helper functions for creating fetch mocks
  const createSuccessfulFetchMock = (responseData: any) => {
    return jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(responseData),
      })
    ) as jest.Mock;
  };

  const createErrorFetchMock = (statusText: any) => {
    return jest.fn(() =>
      Promise.resolve({
        ok: false,
        statusText,
      })
    ) as jest.Mock;
  };

  const mockDurationResponse = {
    output: [
      {
        arguments: JSON.stringify({ duration: 25 }),
      },
    ],
  };

  const mockEmptyResponse = {
    output: [{}],
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  beforeEach(() => {
    // Default mock setup
    global.fetch = createSuccessfulFetchMock(mockDurationResponse);
  });

  test('performToolCall throws an error when response is not ok', async () => {
    global.fetch = createErrorFetchMock('Bad Request');
    await expect(performToolCall('Test input', OPENAI_TOOLS.setDuration)).rejects.toThrow(
      'Error: Bad Request'
    );
  });

  test("performToolCall returns null when LLM doesn't execute tool call", async () => {
    global.fetch = createSuccessfulFetchMock(mockEmptyResponse);
    expect(await performToolCall('Test input', OPENAI_TOOLS.setDuration)).toBeNull();
  });

  test('inferDuration returns estimated duration', async () => {
    // Uses default mock from beforeEach
    const result = await inferDuration('Write a report');
    expect(result).toBe(25);
  });

  test("inferDuration returns null when LLM doesn't execute tool call", async () => {
    global.fetch = createSuccessfulFetchMock(mockEmptyResponse);
    const result = await inferDuration('Write a report');
    expect(result).toBeNull();
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

  test('generateMissingDurations defaults to 0 when LLM call fails', async () => {
    global.fetch = createSuccessfulFetchMock(mockEmptyResponse);
    const tasks = [{ text: 'Do laundry', duration: null, location: null }];
    await generateMissingDurations(tasks as any);
    expect(tasks[0].duration).toBe(0);
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
