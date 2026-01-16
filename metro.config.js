const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Agregar soporte para event-target-shim
config.resolver.extraNodeModules = {
  'event-target-shim': require.resolve('event-target-shim'),
};

module.exports = config;