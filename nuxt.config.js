module.exports = {
  mode: 'spa',
  head: {
    title: process.env.npm_package_name || '',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      {
        hid: 'description',
        name: 'description',
        content: process.env.npm_package_description || '',
      },
    ],
    link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }],
  },
  loading: { color: '#fff' },
  css: ['element-ui/lib/theme-chalk/index.css'],
  plugins: ['@/plugins/element-ui'],
  buildModules: ['@nuxtjs/eslint-module'],
  modules: ['@nuxtjs/axios'],
  axios: {},
  build: {
    transpile: [/^element-ui/],
    extend(config, ctx) {},
  },
  env: {
    mapStyleUrl: process.env.MAP_STYLE_URL || '',
    geocodingUrl: process.env.GEOCODING_URL || '',
    routingUrl: process.env.ROUTING_URL || '',
  },
  server: {
    port: process.env.NODE_ENV === 'development' ? 3000 : 3001, // default: 3000
    host: '0.0.0.0', // default: localhost,
    timing: false,
  },
};
