module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'react-native-reanimated/plugin',
      [
        'module-resolver',
        {
          root: ['./src'],
          extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json', '.node'],
          alias: {
            '@': './src',
            '@components': './src/components',
            '@screens': './src/screens',
            '@theme': './src/theme',
            '@stores': './src/stores',
            '@services': './src/services',
            '@types': './src/types',
            '@navigation': './src/navigation',
          },
        },
      ],
    ],
  };
};
