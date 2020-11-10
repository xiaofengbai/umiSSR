import { defineConfig } from 'umi';
const outputPath = 'dist/';

const env = process.env.NODE_ENV;
const path = env === 'development' ? 'http://127.0.0.1:8000/' : outputPath;

export default defineConfig({
  nodeModulesTransform: {
    type: 'none',
  },
  ssr: {
    mode: 'stream',
  },
  outputPath: outputPath,
  publicPath: path,
  antd: { dark: false },
  dva: { immer: true, hmr: false },
  dynamicImport: {},
});
