import { formatDuration, getLocations } from '@/modules/map/MapService';
import fetchMock from 'jest-fetch-mock';

describe('formatDuration', () => {
  test('should return "Unavailable" when input is null', () => {
    const result = formatDuration(null);
    expect(result).toBe('Unavailable');
  });

  test('should return "0 min" for 0 seconds', () => {
    const result = formatDuration(0);
    expect(result).toBe('0 min');
  });

  test('should return "1 min" for 60 seconds', () => {
    const result = formatDuration(60);
    expect(result).toBe('1 min');
  });

  test('should return "2 min" for 120 seconds', () => {
    const result = formatDuration(120);
    expect(result).toBe('2 min');
  });

  test('should return "59 min" for 3540 seconds (59 minutes)', () => {
    const result = formatDuration(3540);
    expect(result).toBe('59 min');
  });

  test('should return "1h 0m" for 3600 seconds (1 hour)', () => {
    const result = formatDuration(3600);
    expect(result).toBe('1h 0m');
  });

  test('should return "1h 30m" for 5400 seconds (1 hour 30 minutes)', () => {
    const result = formatDuration(5400);
    expect(result).toBe('1h 30m');
  });

  test('should return "2h 15m" for 8100 seconds (2 hours 15 minutes)', () => {
    const result = formatDuration(8100);
    expect(result).toBe('2h 15m');
  });

  test('should return "3h 0m" for 10800 seconds (3 hours)', () => {
    const result = formatDuration(10800);
    expect(result).toBe('3h 0m');
  });
});

describe('getLocations', () => {
  beforeEach(() => {
    fetchMock.resetMocks();
  });

  it('should return mapped locations when API returns features', async () => {
    const mockResponse = {
      features: [
        {
          properties: {
            name: 'San Francisco',
            place_formatted: 'California, USA',
          },
          geometry: {
            coordinates: [-122.4194, 37.7749],
          },
        },
        {
          properties: {
            name: 'San Jose',
            place_formatted: 'California, USA',
          },
          geometry: {
            coordinates: [-121.8863, 37.3382],
          },
        },
      ],
    };
    fetchMock.mockResponseOnce(JSON.stringify(mockResponse));
    const result = await getLocations('San');
    expect(result).toEqual([
      {
        name: 'San Francisco, California, USA',
        coordinates: [-122.4194, 37.7749],
      },
      {
        name: 'San Jose, California, USA',
        coordinates: [-121.8863, 37.3382],
      },
    ]);
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('https://api.mapbox.com/search/geocode/v6/forward?q=San')
    );
  });

  it('should handle missing place_formatted gracefully', async () => {
    const mockResponse = {
      features: [
        {
          properties: {
            name: 'San Francisco',
            // No place_formatted
          },
          geometry: {
            coordinates: [-122.4194, 37.7749],
          },
        },
      ],
    };

    fetchMock.mockResponseOnce(JSON.stringify(mockResponse));
    const result = await getLocations('San Francisco');
    expect(result).toEqual([
      {
        name: 'San Francisco, ',
        coordinates: [-122.4194, 37.7749],
      },
    ]);
  });

  it('should return empty array when no features are returned', async () => {
    const mockResponse = { features: [] };
    fetchMock.mockResponseOnce(JSON.stringify(mockResponse));
    const result = await getLocations('NonexistentPlace');
    expect(result).toEqual([]);
  });

  it('should return empty array when API response is invalid', async () => {
    fetchMock.mockResponseOnce(JSON.stringify({}));
    const result = await getLocations('InvalidQuery');
    expect(result).toEqual([]);
  });

  it('should handle API errors gracefully', async () => {
    fetchMock.mockRejectOnce(new Error('API Error'));
    await expect(getLocations('ErrorTest')).rejects.toThrow('API Error');
  });
});
