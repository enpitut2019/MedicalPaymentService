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
            },
            {
                test: /\.(png|jpe?g|gif)$/i,
                use: ['file-loader']
            }
        ]
    },
    devServer: {
        open: true,
        port: 8081,
        host: '0.0.0.0',
        disableHostCheck: true,
        contentBase: `${__dirname}/dist`,
        historyApiFallback: true
    },
    plugins: [new VueLoaderPlugin()]
};