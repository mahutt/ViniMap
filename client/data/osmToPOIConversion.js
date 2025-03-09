const fs = require('fs');
const https = require('https');

// Your Google Maps API key - replace with your actual key
const GOOGLE_API_KEY = process.env.EXPO_PUBLIC_GOOGLEMAPS_API_KEY || 'YOUR_GOOGLE_API_KEY';

// Read OSM data
const osmData = JSON.parse(fs.readFileSync('C:\\ViniMap\\client\\data\\export.geojson', 'utf8'));

// Convert data with basic address enhancement
convertWithAddressEnhancement(osmData)
  .then((result) => {
    fs.writeFileSync(
      'C:\\ViniMap\\client\\data\\PointsOfInterest.json',
      JSON.stringify(result, null, 2)
    );
    console.log('Conversion complete! Check C:\\ViniMap\\client\\data\\PointsOfInterest.json');
  })
  .catch((error) => {
    console.error('Error during conversion:', error);
  });

async function convertWithAddressEnhancement(osmData) {
  const pointsOfInterest = [];
  let idCounter = 1;
  let googleApiCalls = 0;

  console.log(`Processing ${osmData.features.length} features...`);

  for (const feature of osmData.features) {
    const props = feature.properties;
    const osmId = props['@id'] ? props['@id'].split('/')[1] : idCounter++;

    let coordinates;
    if (feature.geometry.type === 'Point') {
      coordinates = feature.geometry.coordinates;
    } else if (feature.geometry.type === 'Polygon') {
      coordinates = calculatePolygonCentroid(feature.geometry.coordinates[0]);
    } else {
      continue;
    }

    let type = determinePoiType(props);
    if (!type) continue;

    // Format address from OSM data if available
    let address = formatAddress(props);

    // If address is unavailable, try Google Maps API - limited to avoid rate limiting
    if (address === 'Address unavailable' && googleApiCalls < 50) {
      try {
        console.log(`Trying Google Maps for ${props.name || 'unnamed POI'}...`);
        const googleAddress = await getAddressFromGoogle(coordinates);
        googleApiCalls++;

        if (googleAddress) {
          address = googleAddress;
          console.log(`  → Found address: ${address}`);
        } else {
          console.log(`  → No address found - using "Address unavailable"`);
        }
      } catch (error) {
        console.warn(`Error with Google API: ${error.message}`);
      }
    }

    const openingHours = determineOpeningHours(props);
    const description = createDescription(props, type);

    const poi = {
      id: `${type}-${osmId}`,
      name: props.name || `Unnamed ${type.charAt(0).toUpperCase() + type.slice(1)}`,
      coordinates: coordinates,
      address: address,
      type: type,
      openingHours: openingHours,
      description: description,
    };

    pointsOfInterest.push(poi);
    console.log(`Processed: ${poi.name} (${poi.type})`);
  }

  console.log(
    `Processed ${pointsOfInterest.length} POIs (Made ${googleApiCalls} Google API calls)`
  );
  return { pointsOfInterest };
}

function getAddressFromGoogle(coordinates) {
  return new Promise((resolve, reject) => {
    // Google Maps expects coordinates as lat,lng
    const [lng, lat] = coordinates;

    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_API_KEY}`;

    https
      .get(url, (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          try {
            const response = JSON.parse(data);

            if (response.status === 'OK' && response.results && response.results.length > 0) {
              resolve(response.results[0].formatted_address);
            } else {
              resolve(null);
            }
          } catch (error) {
            reject(error);
          }
        });
      })
      .on('error', (error) => {
        reject(error);
      });
  });
}

function calculatePolygonCentroid(coordinates) {
  let sumX = 0;
  let sumY = 0;

  for (const coord of coordinates) {
    sumX += coord[0];
    sumY += coord[1];
  }

  return [
    parseFloat((sumX / coordinates.length).toFixed(7)),
    parseFloat((sumY / coordinates.length).toFixed(7)),
  ];
}

function determinePoiType(props) {
  if (props.amenity === 'bicycle_rental' || props.amenity === 'bike_rental') {
    return 'bixi';
  } else if (props.railway === 'station' || props.railway === 'subway_entrance') {
    return 'metro';
  } else if (props.highway === 'bus_stop') {
    return 'bus';
  } else if (
    props.amenity === 'restaurant' ||
    props.amenity === 'cafe' ||
    props.amenity === 'fast_food'
  ) {
    return 'restaurant';
  } else if (props.leisure === 'park') {
    return 'park';
  } else if (props.amenity === 'library') {
    return 'library';
  } else if (props.shop) {
    return 'shopping';
  } else {
    return null;
  }
}

function formatAddress(props) {
  if (props['addr:housenumber'] && props['addr:street']) {
    const housenumber = props['addr:housenumber'];
    const street = props['addr:street'];
    const city = props['addr:city'] || 'Montréal';
    const province = props['addr:province'] || 'Québec';
    const postcode = props['addr:postcode'] || '';

    return `${housenumber} ${street}, ${city}, ${province}${postcode ? `, ${postcode}` : ''}`;
  } else {
    return 'Address unavailable';
  }
}

function determineOpeningHours(props) {
  if (props.opening_hours) {
    return {
      isOpen: isCurrentlyOpen(props.opening_hours),
      hours: props.opening_hours,
    };
  } else {
    if (props.leisure === 'park') {
      return { isOpen: true, hours: 'Dawn to dusk' };
    } else if (props.amenity === 'restaurant') {
      return { isOpen: true, hours: 'Typically 11:00-22:00' };
    } else if (props.highway === 'bus_stop') {
      return { isOpen: true, hours: '24/7' };
    } else {
      return { isOpen: true, hours: 'Unknown' };
    }
  }
}

function isCurrentlyOpen(hoursString) {
  if (!hoursString) return false;

  try {
    const now = new Date();
    const day = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const hour = now.getHours();
    const minute = now.getMinutes();

    const dayNames = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
    const today = dayNames[day];

    if (hoursString === '24/7') return true;
    if (hoursString === 'closed') return false;

    const parts = hoursString.split(';').map((s) => s.trim());

    for (const part of parts) {
      const dayMatch = isDayApplicable(part, today);
      if (!dayMatch) continue;

      const timeRanges = extractTimeRanges(part);
      const currentTime = hour * 60 + minute; // convert to minutes since midnight

      for (const range of timeRanges) {
        const [start, end] = range;

        if (currentTime >= start && currentTime < end) {
          return true;
        }
      }
    }

    return false;
  } catch (e) {
    console.error('Error parsing opening hours:', e);
    return false;
  }
}

function isDayApplicable(part, today) {
  if (!part.includes(' ')) return true;

  const dayPart = part.split(' ')[0];

  const dayRanges = dayPart.split(',');

  for (const range of dayRanges) {
    if (range.includes('-')) {
      const [start, end] = range.split('-');
      const days = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
      const startIdx = days.indexOf(start);
      const endIdx = days.indexOf(end);

      if (startIdx === -1 || endIdx === -1) continue;

      const todayIdx = days.indexOf(today);

      if (startIdx <= endIdx) {
        if (todayIdx >= startIdx && todayIdx <= endIdx) return true;
      } else {
        if (todayIdx >= startIdx || todayIdx <= endIdx) return true;
      }
    } else if (range === today) {
      return true;
    }
  }

  return false;
}

function extractTimeRanges(part) {
  const timePart = part.includes(' ') ? part.split(' ').slice(1).join(' ') : part;
  const ranges = [];
  const timeRanges = timePart.split(',').map((s) => s.trim());

  for (const timeRange of timeRanges) {
    if (timeRange === 'off' || timeRange === 'closed') {
      continue;
    }

    if (timeRange.includes('-')) {
      const [startStr, endStr] = timeRange.split('-');

      const start = parseTimeToMinutes(startStr);
      let end = parseTimeToMinutes(endStr);

      if (end < start) {
        end += 24 * 60; // Add a day in minutes
      }

      ranges.push([start, end]);
    }
  }

  return ranges;
}

function parseTimeToMinutes(timeStr) {
  const [hourStr, minuteStr] = timeStr.split(':');
  const hour = parseInt(hourStr, 10);
  const minute = minuteStr ? parseInt(minuteStr, 10) : 0;

  return hour * 60 + minute;
}

function createDescription(props, type) {
  switch (type) {
    case 'bixi':
      return `Bike sharing station${props.capacity ? ` with ${props.capacity} docks` : ''}`;
    case 'metro':
      return `Metro station${props.network ? ` on the ${props.network} network` : ''}`;
    case 'bus':
      return `Bus stop${props.route_ref ? ` serving routes ${props.route_ref}` : ''}`;
    case 'restaurant':
      return `${
        props.cuisine
          ? capitalizeWords(props.cuisine.replace(';', ', ')) + ' restaurant'
          : 'Restaurant'
      }${props.website ? ` (${props.website})` : ''}`;
    case 'park':
      return `Public park${props.website ? ` (${props.website})` : ''}`;
    case 'library':
      return `Public library${props.website ? ` (${props.website})` : ''}`;
    case 'shopping':
      return `${props.shop ? capitalizeWords(props.shop) + ' shop' : 'Shop'}${
        props.website ? ` (${props.website})` : ''
      }`;
    default:
      return '';
  }
}

function capitalizeWords(str) {
  return str
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
