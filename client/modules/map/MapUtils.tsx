import { Coordinates } from './MapContext';

/**
 * Calculates the Euclidean distance between two points.
 *
 * @param start - The starting coordinates as a tuple [x, y].
 * @param end - The ending coordinates as a tuple [x, y].
 * @returns The Euclidean distance between the start and end coordinates.
 */
const calculateEuclideanDistance = (start: Coordinates, end: Coordinates): number => {
  return Math.sqrt(Math.pow(start[0] - end[0], 2) + Math.pow(start[1] - end[1], 2));
};

export { calculateEuclideanDistance };
