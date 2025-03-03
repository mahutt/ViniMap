import { getCurrentLocationAsStart } from '@/modules/map/LocationHelper';
import CoordinateService from '@/services/CoordinateService';

// Mock the CoordinateService and console.error
jest.mock('@/services/CoordinateService', () => ({
  getCurrentCoordinates: jest.fn(),
}));

const mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

describe('getCurrentLocationAsStart', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    mockConsoleError.mockRestore();
  });

  it('should set location when coordinates are successfully retrieved', async () => {
    const mockCoordinates = {
      latitude: 40.7128,
      longitude: -74.006,
    };

    (CoordinateService.getCurrentCoordinates as jest.Mock).mockResolvedValue(mockCoordinates);

    const mockSetLocation = jest.fn();

    await getCurrentLocationAsStart(mockSetLocation);

    expect(CoordinateService.getCurrentCoordinates).toHaveBeenCalledTimes(1);
    expect(mockSetLocation).toHaveBeenCalledWith({
      name: 'Current location',
      coordinates: mockCoordinates,
    });
    expect(console.error).not.toHaveBeenCalled();
  });

  it('should not call setLocation when no coordinates are returned', async () => {
    (CoordinateService.getCurrentCoordinates as jest.Mock).mockResolvedValue(null);

    const mockSetLocation = jest.fn();

    await getCurrentLocationAsStart(mockSetLocation);

    expect(CoordinateService.getCurrentCoordinates).toHaveBeenCalledTimes(1);
    expect(mockSetLocation).not.toHaveBeenCalled();
    expect(console.error).not.toHaveBeenCalled();
  });

  it('should handle errors when getting coordinates fails', async () => {
    const mockError = new Error('Coordinate retrieval failed');

    (CoordinateService.getCurrentCoordinates as jest.Mock).mockRejectedValue(mockError);

    const mockSetLocation = jest.fn();

    await getCurrentLocationAsStart(mockSetLocation);

    expect(CoordinateService.getCurrentCoordinates).toHaveBeenCalledTimes(1);
    expect(mockSetLocation).not.toHaveBeenCalled();
    expect(console.error).toHaveBeenCalledWith('Error getting current location:', mockError);
  });
});
