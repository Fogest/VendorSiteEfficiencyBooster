const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
  mode: "production",
  devtool: "inline-source-map",
  entry: {
    background: "./src/background/background.ts",
    content: "./src/content/content.ts",
    popup: "./src/popup/popup.ts", // Add popup entry point
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },
  output: {
    filename: "[name].js",
    path: path.resolve(__dirname, "dist"),
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: "src/manifest.json", to: "manifest.json" },
        { from: "public", to: "public" },
        { from: "src/popup/popup.html", to: "popup.html" }, // Copy popup HTML
        { from: "src/popup/popup.css", to: "popup.css" }, // Copy popup CSS
      ],
    }),
  ],
};
