module.exports = {
  runtimeCaching: [
    {
      handler: 'fastest',
      urlPattern: /\/@webcomponents\/webcomponentsjs\//,
    },
  ],
  staticFileGlobs: ['manifest.json', 'src/**/*'],
};
