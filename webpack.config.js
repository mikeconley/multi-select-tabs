const path = require("path");

const webpack = require("webpack");

module.exports = {
  entry: [
    path.resolve(__dirname, "src", "js", "index.jsx"),
    path.resolve(__dirname, "src", "sidebar.css"),
    path.resolve(__dirname, "src", "sidebar.html"),
  ],
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "sidebar.js",
  },
  resolve: {
    extensions: [".js", ".jsx"],
    modules: [
      "node_modules",
      path.resolve(__dirname, "src", "js"),
    ],
  },
  module: {
    rules: [
      {
        test: /\.(css|html)$/,
        use: {
          loader: "file-loader",
          options: {
            name: "[name].[ext]",
          },
        },
      },
      { test: /\.js$/, exclude: /node_modules/, use: "babel-loader" },
      {
        test: /\.jsx$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: { 
            presets: ["babel-preset-react"],
            plugins: [
              ["transform-class-properties", {"spec": true}],
            ],
          }, 
        },
      },
    ],
  },
  plugins: [
    new webpack.DefinePlugin({
      "process.env": {
        NODE_ENV: `'${process.env.NODE_ENV}'`,
      },
    }),
  ],
};
