import path from 'path';

const isProduction = process.env.NODE_ENV == 'production';

export default {
  entry: './index.mjs',
  mode: isProduction ? 'production' : 'development',
  output: {
    path: path.resolve('./dist'),
    libraryTarget: 'umd',
    filename: `soldi-${path.basename(process.cwd())}.js`,
  },
  optimization: {
    minimize: isProduction,
  },
};
