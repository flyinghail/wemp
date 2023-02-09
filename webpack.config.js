const path = require('path');

module.exports = {
  entry: './src/main.ts',
  target: 'electron-main',
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'bundle.js'
  },
  resolve: {
    extensions: ['.ts', '.js']
  },
  module: {
    rules: [{
      test: /\.ts$/,
      use: [{ loader: 'ts-loader' }]
    }]
  }
};
