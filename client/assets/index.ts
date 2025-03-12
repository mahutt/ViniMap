import Mapbox from '@rnmapbox/maps';

export const images: {
  [key: string]: Mapbox.ImageEntry;
} = {
  bank: require('./icons/bank.png'),
  cafe: require('./icons/cafe.png'),
  'drinking-water': require('./icons/drinking-water.png'),
  'fast-food': require('./icons/fast-food.png'),
  information: require('./icons/information.png'),
  'picnic-site': require('./icons/picnic-site.png'),
  restaurant: require('./icons/restaurant.png'),
  toilet: require('./icons/toilet.png'),
};
