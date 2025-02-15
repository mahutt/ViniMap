import { calculateEuclideanDistance } from '@/modules/map/MapUtils';

describe('calculateEuclideanDistance', () => {
  test('should accurately calculate the Euclidean distance between two points', () => {
    const result = calculateEuclideanDistance([45.4509412, -73.6481951], [45.459564, -73.635818]);
    expect(result).toBeCloseTo(0.01508, 5);
  });

  test('should return 0 when both points are the same', () => {
    const result = calculateEuclideanDistance([45.4509412, -73.6481951], [45.4509412, -73.6481951]);
    expect(result).toBe(0);
  });

  test('should correctly handle negative coordinates', () => {
    const result = calculateEuclideanDistance([-10, -10], [-20, -20]);
    expect(result).toBeCloseTo(14.1421, 4);
  });

  test('should correctly handle points along the same axis', () => {
    const resultX = calculateEuclideanDistance([10, 0], [20, 0]);
    expect(resultX).toBe(10);

    const resultY = calculateEuclideanDistance([0, 10], [0, 20]);
    expect(resultY).toBe(10);
  });
});
