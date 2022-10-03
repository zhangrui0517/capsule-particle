const config = {
  /** 要打包的文件根目录 */
  // root: 'test',
  /** 是否需要动态polyfill注入 */
  // dynamicPolyfill: true
  /** 是否启用babel对react的解析 */
  // react: true,
  /** webpack config 自定义调整，会通过webpack.merge与预设webpack配置合并 */
  config: webpackConfig => {
    webpackConfig.output = {
      ...webpackConfig.output,
      library: {
        name: 'capsule-particle',
        type: 'umd'
      },
      filename: '[name].js'
    }
    if (webpackConfig.mode === 'production') {
      webpackConfig.plugins = webpackConfig.plugins.filter(plugin => plugin.constructor.name !== 'HtmlWebpackPlugin')
    }
    return webpackConfig
  }
  // analyzer: {}
}

module.exports = config
