const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
module.exports = {
    //  webpack插件配置
  configureWebpack: config => {
    let plugins = [
      new UglifyJsPlugin({
        uglifyOptions: {
          compress: {
            warnings: false,
            drop_debugger: true,
            drop_console: true,
          },
          output: {
            comments: false,
          },
        },
        sourceMap: false,
        parallel: true,
      })
    ]
    if (process.env.NODE_ENV !== 'development') {
      config.plugins = [...config.plugins, ...plugins]
    }
  },
}