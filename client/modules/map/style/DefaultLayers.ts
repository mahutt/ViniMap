import defaultLayers from './StyleLayers';
import { LayerSpecification } from '../Types';

/**
 * Transform the generic "poi-indoor" layer into multiple layers using filters based on OSM tags
 */

const POI_LAYER_ID = 'poi-indoor';

type FilterMakiEntry = {
  filter: any;
  maki: string;
};

const OSM_FILTER_MAPBOX_MAKI_LIST: FilterMakiEntry[] = [
  {
    filter: ['filter-==', 'amenity', 'fast_food'],
    maki: 'fast-food',
  },
  {
    filter: ['filter-==', 'amenity', 'restaurant'],
    maki: 'restaurant',
  },
  {
    filter: ['filter-==', 'amenity', 'cafe'],
    maki: 'cafe',
  },
  {
    filter: ['filter-==', 'amenity', 'vending_machine'], // used to be filter: ['in', ['get', 'amenity'], ['literal', ['bank', 'vending_machine']]],
    maki: 'soda',
  },
  {
    filter: ['filter-==', 'amenity', 'toilets'],
    maki: 'toilet',
  },
  {
    filter: ['filter-==', 'amenity', 'fountain'],
    maki: 'water',
  },
  {
    filter: ['filter-==', 'amenity', 'eating_area'],
    maki: 'picnic-site',
  },
  {
    filter: ['filter-==', 'amenity', 'information'],
    maki: 'information',
  },
  {
    filter: ['any', ['filter-==', 'highway', 'elevator'], ['has', 'elevator']],
    maki: 'elevator',
  },
  {
    filter: ['filter-==', 'conveying', 'yes'],
    maki: 'escalator',
  },
  {
    filter: ['filter-==', 'stairs', 'yes'],
    maki: 'stairs',
  },
  {
    filter: ['filter-==', 'natural', 'tree'],
    maki: 'park',
  },
  {
    filter: ['filter-==', 'shop', 'travel_agency'],
    maki: 'suitcase',
  },
  {
    filter: ['filter-==', 'shop', 'convenience'],
    maki: 'grocery',
  },
  {
    filter: ['filter-==', 'shop', 'bakery'],
    maki: 'bakery',
  },
  {
    filter: ['filter-==', 'shop', 'chemist'],
    maki: 'pharmacy',
  },
  {
    filter: ['filter-==', 'shop', 'clothes'],
    maki: 'clothing-store',
  },
  {
    filter: ['filter-==', 'highway', 'steps'],
    maki: 'entrance',
  },
];

function createPoiLayers(metaLayer: LayerSpecification): LayerSpecification[] {
  const otherShopsEntry = {
    filter: [
      'all',
      ['has', 'shop'],
      [
        '!',
        [
          'in',
          ['get', 'shop'],
          [
            'literal',
            [
              ...OSM_FILTER_MAPBOX_MAKI_LIST.filter((val) => val.filter[1] === 'shop').map(
                (val) => val.filter[2]
              ),
            ],
          ],
        ],
      ],
    ],
    maki: 'shop',
  };

  const otherAmenitiesEntry = {
    filter: [
      'all',
      ['has', 'amenity'],
      [
        '!',
        [
          'in',
          ['get', 'amenity'],
          [
            'literal',
            [
              ...OSM_FILTER_MAPBOX_MAKI_LIST.filter((val) => val.filter[1] === 'amenity').map(
                (val) => val.filter[2]
              ),
            ],
          ],
        ],
      ],
    ],
    maki: 'amenity',
  };

  return OSM_FILTER_MAPBOX_MAKI_LIST.concat(otherShopsEntry)
    .concat(otherAmenitiesEntry)
    .map((poi) => {
      const newLayer: LayerSpecification = { ...metaLayer };
      newLayer.id += `-${poi.maki}`;
      newLayer.filter = poi.filter;
      newLayer.style = { ...metaLayer.style, iconImage: poi.maki };
      return newLayer;
    });
}

let pendingLayers: LayerSpecification[] = defaultLayers;
const poiLayer = pendingLayers.find((layer) => layer.id === POI_LAYER_ID);
if (poiLayer) {
  // Convert poi-indoor layer into several poi-layers
  createPoiLayers(poiLayer).forEach((_layer) => pendingLayers.push(_layer));
  pendingLayers = pendingLayers.filter((layer) => layer.id !== POI_LAYER_ID);
}
const layers = pendingLayers;

export default layers;
