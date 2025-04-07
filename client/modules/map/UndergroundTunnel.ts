import type { Feature, LineString } from 'geojson';
import tunnelGeojson from '@/assets/geojson/tunnel.json';
import { IndoorMap, Route } from './Types';

const tunnelLineString = tunnelGeojson.features.find(
  (feature) => feature.properties?.highway === 'footway'
) as Feature<LineString>;
const tunnelSteps = tunnelLineString.geometry.coordinates;
const tunnelRoute: Route = {
  duration: 5 * 60, // Roughly 5 minutes to walk through the tunnel
  distance: 200, // Roughly 200 meters
  segments: [
    {
      id: 'tunnel-segment',
      type: 'dashed',
      steps: tunnelSteps,
    },
  ],
};

// Currently, the tunnel is only used for routes between Hall Building and John Molson Building
const shouldUseTunnel = (startIndoorMap: IndoorMap, endIndoorMap: IndoorMap): boolean => {
  return (
    ['Hall Building (H)', 'John Molson Building (MB)'].includes(startIndoorMap.id) &&
    ['Hall Building (H)', 'John Molson Building (MB)'].includes(endIndoorMap.id)
  );
};

export { tunnelGeojson, tunnelSteps, tunnelRoute, shouldUseTunnel };
