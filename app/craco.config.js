const { addBeforeLoader, loaderByName, addAfterLoader } = require("@craco/craco");

module.exports = {
  overrideWebpackConfig: ({
    webpackConfig, cracoConfig, pluginOptions, context: { env, paths }
  }) => {
    const compiledCssInJs = {
      test: /\.(js|ts|tsx)$/,
      exclude: /node_modules/,
      use: [
        { loader: 'babel-loader' },
        {
          loader: '@compiled/webpack-loader',
        },
      ],
    };
    addAfterLoader(webpackConfig, loaderByName("file-loader"), compiledCssInJs)
    return webpackConfig;
  },
  babel: {
    presets: ["@emotion/babel-preset-css-prop"],
    plugins: [
      ["@compiled/babel-plugin", { cache: true, importReact: false }]
    ]
  },
};