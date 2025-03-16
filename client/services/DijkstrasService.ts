import type { Feature, LineString, Position } from 'geojson';
import turfDistance from '@turf/distance';
import { point } from '@turf/helpers';

export function findShortestPath(
  startCoord: Position,
  endCoord: Position,
  footwayFeatures: Feature<LineString>[]
) {
  let graph: Record<string, { node: string; dist: number }[]> = {};
  footwayFeatures.forEach((feat) => {
    let coords = feat.geometry.coordinates;
    for (let i = 0; i < coords.length - 1; i++) {
      let a = coords[i],
        b = coords[i + 1];
      let aKey = `${a[1]},${a[0]}`,
        bKey = `${b[1]},${b[0]}`;
      let dist = turfDistance(point(a), point(b), { units: 'meters' });

      if (!graph[aKey]) graph[aKey] = [];
      if (!graph[bKey]) graph[bKey] = [];
      graph[aKey].push({ node: bKey, dist });
      graph[bKey].push({ node: aKey, dist });
    }
  });

  let startKey = `${startCoord[1]},${startCoord[0]}`;
  let endKey = `${endCoord[1]},${endCoord[0]}`;

  if (!graph[startKey]) graph[startKey] = [];
  if (!graph[endKey]) graph[endKey] = [];

  let distances: Record<string, number> = {};
  let prevNode: Record<string, string> = {};
  let remaining = new Set(Object.keys(graph));

  remaining.forEach((node) => {
    distances[node] = Infinity;
  });
  distances[startKey] = 0;

  while (remaining.size > 0) {
    let current = [...remaining].reduce(
      (a, b) => (distances[a] < distances[b] ? a : b),
      [...remaining][0]
    );
    if (current === endKey || distances[current] === Infinity) break;
    remaining.delete(current);

    graph[current].forEach((neighbor) => {
      if (!remaining.has(neighbor.node)) return;
      let alt = distances[current] + neighbor.dist;
      if (alt < distances[neighbor.node]) {
        distances[neighbor.node] = alt;
        prevNode[neighbor.node] = current;
      }
    });
  }

  if (!prevNode[endKey] && startKey !== endKey) return null;

  let pathNodes = [endKey];
  let node = endKey;
  while (prevNode[node]) {
    node = prevNode[node];
    pathNodes.push(node);
  }
  pathNodes.reverse();

  return pathNodes.map((key) => key.split(',').map(Number).reverse());
}
