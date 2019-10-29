const { VueLoaderPlugin } = require("vue-loader");

module.exports = {
    mode: "development",
    entry: "./src/index.js",
    output: {
        path: `${__dirname}/dist`,
        filename: "bundle.js"
    },
    module: {
        rules: [
            {
                test: /\.vue$/,
                use: "vue-loader"
            },
            {
                test: /\.css$/,
                use: ["vue-style-loader", "css-loader"]
            }
        ]
    },
    devServer: {
        open: true,
        port: 8083,
        host: '0.0.0.0',
        disableHostCheck: true,
        contentBase: `${__dirname}/dist`,
        historyApiFallback: true,
        liveReload: false
    },
    plugins: [new VueLoaderPlugin()]
};