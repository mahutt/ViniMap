import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import LocationsAutocomplete from '@/components/LocationsAutocomplete';
import { getLocations } from '@/modules/map/MapService';

// Mock the MapService
jest.mock('@/modules/map/MapService', () => ({
  getLocations: jest.fn(),
}));

describe('LocationsAutocomplete', () => {
  const TEST_LOCATIONS = [
    { name: 'Montreal', coordinates: [-73.5674, 45.5019] as [number, number] },
    { name: 'Quebec City', coordinates: [-71.2082, 46.8139] as [number, number] },
    { name: 'Ottawa', coordinates: [-75.6972, 45.4215] as [number, number] },
  ];

  const defaultProps = {
    query: 'Mont',
    callback: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders correctly with locations', async () => {
    // Setup the mock before rendering
    (getLocations as jest.Mock).mockResolvedValue(TEST_LOCATIONS);

    const { findByText } = render(<LocationsAutocomplete {...defaultProps} />);
    const montrealText = await findByText('Montreal');
    const quebecText = await findByText('Quebec City');
    const ottawaText = await findByText('Ottawa');

    expect(montrealText).toBeTruthy();
    expect(quebecText).toBeTruthy();
    expect(ottawaText).toBeTruthy();
  });

  test('does not render anything when no locations are returned', async () => {
    (getLocations as jest.Mock).mockResolvedValue([]);

    const { queryByText } = render(<LocationsAutocomplete {...defaultProps} />);

    await waitFor(() => {
      expect(getLocations).toHaveBeenCalledWith('Mont');
    });

    await waitFor(() => {
      expect(queryByText('Montreal')).toBeNull();
    });
  });

  test('calls getLocations when query changes', async () => {
    (getLocations as jest.Mock).mockResolvedValue(TEST_LOCATIONS);

    const { rerender } = render(<LocationsAutocomplete {...defaultProps} />);

    await waitFor(() => {
      expect(getLocations).toHaveBeenCalledWith('Mont');
    });

    (getLocations as jest.Mock).mockClear();
    (getLocations as jest.Mock).mockResolvedValue(TEST_LOCATIONS);

    await act(async () => {
      rerender(<LocationsAutocomplete query="Bos" callback={defaultProps.callback} />);
    });

    await waitFor(() => {
      expect(getLocations).toHaveBeenCalledWith('Bos');
    });
  });

  test('clears locations when query is empty', async () => {
    (getLocations as jest.Mock).mockResolvedValue(TEST_LOCATIONS);

    const { rerender, findByText, queryByText } = render(
      <LocationsAutocomplete {...defaultProps} />
    );

    await findByText('Montreal');

    (getLocations as jest.Mock).mockClear();

    await act(async () => {
      rerender(<LocationsAutocomplete query="" callback={defaultProps.callback} />);
    });

    await waitFor(() => {
      expect(queryByText('Montreal')).toBeNull();
    });

    expect(getLocations).not.toHaveBeenCalled();
  });

  test('calls callback when a location is selected', async () => {
    (getLocations as jest.Mock).mockResolvedValue(TEST_LOCATIONS);

    const { findByText } = render(<LocationsAutocomplete {...defaultProps} />);
    const montrealItem = await findByText('Montreal');

    await act(async () => {
      fireEvent(montrealItem.parent, 'touchEnd');
    });

    expect(defaultProps.callback).toHaveBeenCalledWith(TEST_LOCATIONS[0]);
  });

  test('clears locations after a location is selected', async () => {
    (getLocations as jest.Mock).mockResolvedValue(TEST_LOCATIONS);

    const { findByText, queryByText } = render(<LocationsAutocomplete {...defaultProps} />);
    const montrealItem = await findByText('Montreal');

    await act(async () => {
      fireEvent(montrealItem.parent, 'touchEnd');
    });

    await waitFor(() => {
      expect(queryByText('Montreal')).toBeNull();
    });
  });

  test('renders nothing when API returns an error', async () => {
    (getLocations as jest.Mock).mockResolvedValue([]);

    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    try {
      const { queryByText } = render(<LocationsAutocomplete {...defaultProps} />);

      await waitFor(() => {
        expect(getLocations).toHaveBeenCalledWith('Mont');
      });

      await waitFor(() => {
        expect(queryByText('Montreal')).toBeNull();
      });
    } finally {
      consoleErrorSpy.mockRestore();
    }
  });
});
