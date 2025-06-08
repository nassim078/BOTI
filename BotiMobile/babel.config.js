module.exports = {
  presets: [
    'babel-preset-expo',
    '@babel/preset-typescript'
  ],
  plugins: [
    ['module:react-native-dotenv'],
    ['@babel/plugin-transform-runtime'],
    '@babel/plugin-proposal-export-namespace-from',
    'react-native-reanimated/plugin'
  ]
};
