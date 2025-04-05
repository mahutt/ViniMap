const { indoorMaps } = require('../modules/map/IndoorMap');
const { footwaysForLevel } = require('../modules/map/IndoorMapUtils');
const GeojsonService = require('../services/GeojsonService').default;

const getDisconnectedRoomsForBuilding = (indoorMap) => {
  const disconnectedRooms = [];
  for (let i = indoorMap.levelsRange.min; i <= indoorMap.levelsRange.max; i++) {
    const footways = footwaysForLevel(indoorMap, i);
    const rooms = indoorMap.geojson.features.filter(
      (feature) => feature.properties?.ref && feature.properties?.level === String(i)
    );
    for (const room of rooms) {
      const roomPositionOptions = GeojsonService.findLinesIntersect(footways, room);
      if (roomPositionOptions.length === 0) {
        disconnectedRooms.push(room.properties?.ref);
      }
    }
  }
  return disconnectedRooms;
};

const verifyMapIntegrity = (indoorMaps) => {
  const allDisconnectedRooms = [];
  for (const indoorMap of indoorMaps) {
    const currentDisconnectedRooms = getDisconnectedRoomsForBuilding(indoorMap);
    allDisconnectedRooms.push(...currentDisconnectedRooms);
  }
  if (allDisconnectedRooms.length > 0) {
    console.log('--------------All Disconnected Rooms Below---------------');
    for (const room of allDisconnectedRooms) {
      console.log(room);
    }
    return 1;
  }
  console.log('All rooms are connected');
  return 0;
};

process.exit(verifyMapIntegrity(indoorMaps));
