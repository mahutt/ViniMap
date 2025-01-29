import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => {
  const existingPlugins = config.plugins || [];

  return {
    ...config,
    name: config.name || 'client',
    slug: config.slug || 'default-slug',
    plugins: [
      ...existingPlugins,
      [
        '@rnmapbox/maps',
        {
          RNMapboxMapsImpl: 'mapbox',
          RNMapboxMapsDownloadToken: process.env.MAPBOX_ACCESS_TOKEN,
        },
      ],
    ],
  };
};
