module.exports = {
  // presets: ["@vue/app"],
  "presets": ["@babel/preset-env"],
  "plugins": [
    ["@babel/plugin-transform-modules-commonjs", {
      "allowTopLevelThis": true
    }]
  ]
};
