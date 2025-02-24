import { Location } from './MapContext';
import CoordinateService from '@/services/CoordinateService';

export const getCurrentLocationAsStart = async (setLocation: (location: Location) => void) => {
  try {
    const tempCoordinates = await CoordinateService.getCurrentCoordinates();

    if (tempCoordinates) {
      setLocation({
        name: 'Current location',
        coordinates: tempCoordinates,
      });
    }
  } catch (error) {
    console.error('Error getting current location:', error);
  }
};
