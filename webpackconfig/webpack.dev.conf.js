
const path = require('path');
const merge = require('webpack-merge');
const webpack = require('webpack');
const HappyPack = require('happypack');
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');
const HtmlWebpackHarddiskPlugin = require('html-webpack-harddisk-plugin');
const OpenBrowserPlugin = require('open-browser-webpack-plugin');
const conf = require('./config');
const theme = require('../theme')
const baseWebpackConfig = require('./webpack.base.conf');
const config = require('config');

const apiDomain = config.get('apiDomain');
const isOpenBrowser = config.get('isOpenBrowser');
const port = config.get('port');
const domain = config.get('domain');
//const configDomain = config.get('configDomain');
//const cdnDomain = config.get('cdnDomain');
//const configImgDomain = config.get('configImgDomain');
const apiVersion = config.get('apiVersion');
const debugUID = config.get('debugUID');
const needTrack = config.get('needTrack');
const ip = require('ip').address();
const cwd = process.cwd();
const src = conf.src;
const happyThreadPool = HappyPack.ThreadPool({ size: 5 });


let webpackConfig = merge(baseWebpackConfig, {
    mode: 'development',
    output: {
        //path: conf.dev.output,
        filename: "scripts/[name].js",
        chunkFilename: 'scripts/[name].js',
        publicPath: conf.dev.publicPath,
        devtoolModuleFilenameTemplate: '[resource-path]',
        sourceMapFilename: '[file].map'
    },
    module: {
        rules: [
            {
                test: /\.css$/,
                use: [
                    {
                        loader: 'style-loader',
                        options: {
                            sourceMap: true,
                            singleton: true
                        }
                    },
                    {
                        loader: 'css-loader',
                        options: {
                            //importLoaders: 1
                            //minimize: true ,
                            sourceMap: true

                        }
                    },
                    {
                        loader: 'postcss-loader',
                        options: {
                            sourceMap: 'inline'
                        }
                    }
                ]
            },
            {
                test: /\.less$/,
                use: 'happypack/loader?id=styles'
            },
            {
                test: /\.js$/,
                exclude: [path.join(cwd, 'node_modules'), path.join(cwd, 'src', 'dll')],
                include: [src],
                use: 'happypack/loader?id=js',
            }
        ]
    },

    devtool: 'cheap-module-eval-source-map',

});

webpackConfig.optimization = {
    namedModules: true, // NamedModulesPlugin()
    noEmitOnErrors: false, // NoEmitOnErrorsPlugin
    concatenateModules: true, //ModuleConcatenationPlugin
    occurrenceOrder: true
};
webpackConfig.plugins.push(new CaseSensitivePathsPlugin(/* { debug: true } */));

webpackConfig.plugins.push(new webpack.DefinePlugin({
    PRODUCTION: JSON.stringify(false),
    API_DOMAIN: JSON.stringify(apiDomain),
    DOMAIN: JSON.stringify(domain),

    MMC_API_VERSION: JSON.stringify(apiVersion.mmc),//买买车
    MMC_WECHAT_API_VERSION: JSON.stringify(apiVersion.mmc_wechat),//买买车
    UCAR_API_VERSION: JSON.stringify(apiVersion.ucar),//专车
    ZUCHE_API_VERSION: JSON.stringify(apiVersion.zuche),//租车
    FCAR_API_VERSION: JSON.stringify(apiVersion.fcar),//闪贷
    DEBUGUID: JSON.stringify(debugUID),
    NEEDTRACK: JSON.stringify(needTrack),

}));

webpackConfig.plugins.push(new HappyPack({
    id: 'js',
    threadPool: happyThreadPool,
    // 3) re-add the loaders you replaced above in #1:
    loaders: [{
        loader: 'babel-loader',
        options: {
            babelrc: true,
            plugins: ['react-hot-loader/babel'],
            //importLoaders: 1
            //minimize: true ,
            sourceMap: true,
            cacheDirectory: true

        }
    }]
}));
webpackConfig.plugins.push(new HappyPack({
    id: 'styles',
    threadPool: happyThreadPool,
    // 3) re-add the loaders you replaced above in #1:
    loaders: [
        {
            loader: 'style-loader',
            options: {
                sourceMap: true,
                singleton: true
            }
        },
        {
            loader: 'css-loader',
            options: {
                //importLoaders: 1
                //minimize: true ,
                sourceMap: true

            }
        },
        {
            loader: 'less-loader',
            options: {
                sourceMap: true,
                javascriptEnabled: true,
                modifyVars: theme
            }
        },

    ]
}));

/* webpackConfig.plugins.push(new webpack.SourceMapDevToolPlugin({
    filename: '[file].map',
    columns: false
})); */
webpackConfig.plugins.push(new HtmlWebpackHarddiskPlugin({
    outputPath: conf.dev.output
}));


webpackConfig.plugins.push(new webpack.NamedModulesPlugin());
if (isOpenBrowser) webpackConfig.plugins.push(new OpenBrowserPlugin({ url: `http:${domain}` }));
webpackConfig.plugins.push(new webpack.HotModuleReplacementPlugin());
//webpackConfig.plugins.push(new webpack.HotModuleReplacementPlugin());
module.exports = webpackConfig;
