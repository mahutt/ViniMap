import { Location } from './MapContext';
import CoordinateService from '@/Services/CoordinateService';

export const getCurrentLocationAsStart = async (setLocation: (location: Location) => void) => {
  try {
    console.log('getCurrentLocationAsStart: Attempting to get coordinates');
    const tempCoordinates = await CoordinateService.getCurrentCoordinates();

    console.log('Coordinates retrieved:', tempCoordinates);

    if (tempCoordinates) {
      console.log('Setting location with coordinates:', tempCoordinates);
      setLocation({
        name: 'Current location',
        coordinates: tempCoordinates,
      });
      console.log('Location set successfully');
    } else {
      console.log('No coordinates available');
    }
  } catch (error) {
    console.error('Detailed error in getCurrentLocationAsStart:', error);
  }
};
