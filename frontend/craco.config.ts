const target = process.env.REACT_APP_API_PROXY || 'http://localhost:3001';

export default {
  devServer(devServerConfig: { proxy?: unknown }) {
    devServerConfig.proxy = [
      {
        context: ['/auth', '/jobs', '/sample', '/health'],
        target,
        changeOrigin: true,
      },
    ];
    return devServerConfig;
  },
};
