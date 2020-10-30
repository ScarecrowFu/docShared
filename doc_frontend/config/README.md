# webpack 配置

通过 `npm run eject` 暴露出来的 webpack 配置

其中自定义配置的内容有：

## 1.配置 less 

定义变量

```javascript
// --- 自定义 --- //
// 添加公共样式
const theme = require('../src/config/theme')
// 匹配 less 规则
const lessRegex = /\.less$/;
const lessRegexNoIdentName = /\.less$/;
const lessModuleRegex = /\.module\.less$/;
// 不使用localIdentName配置的样本路径
const LibraryLessModulePaths = [path.resolve(paths.appSrc, 'library'), ];
// 自定义 这里需要特别注意, 如果不配置以下generateScopedName, webpack 打包的 css 样本 重命名的 hash 值 与 DOM 中生成的 hash 不一致
// 同时必须配置 react-css-modules
const genericNames = require('generic-names');
const generate = genericNames('[local]__[hash:base64:5]', {
  context: process.cwd()
});
const generateScopedName = (localName, filePath) => {
  let relativePath = path.relative(process.cwd(), filePath);
  return generate(localName, relativePath);
};
// --- 自定义 --- //
```

修改 `getStyleLoaders`, otherLoaderOptions, 以及 增加  less-loader

```javascript
const getStyleLoaders = (cssOptions, preProcessor, otherLoaderOptions) => {
    const loaders = [
      isEnvDevelopment && require.resolve('style-loader'),
      isEnvProduction && {
        loader: MiniCssExtractPlugin.loader,
        // css is located in `static/css`, use '../../' to locate index.html folder
        // in production `paths.publicUrlOrPath` can be a relative path
        options: paths.publicUrlOrPath.startsWith('.')
            ? { publicPath: '../../' }
            : {},
      },
      {
        loader: require.resolve('css-loader'),
        options: cssOptions,
      },
      {
        // Options for PostCSS as we reference these options twice
        // Adds vendor prefixing based on your specified browser support in
        // package.json
        loader: require.resolve('postcss-loader'),
        options: {
          // Necessary for external CSS imports to work
          // https://github.com/facebook/create-react-app/issues/2677
          ident: 'postcss',
          plugins: () => [
            require('postcss-flexbugs-fixes'),
            require('postcss-preset-env')({
              autoprefixer: {
                flexbox: 'no-2009',
              },
              stage: 3,
            }),
            // Adds PostCSS Normalize as the reset css with default options,
            // so that it honors browserslist config in package.json
            // which in turn let's users customize the target behavior as per their needs.
            postcssNormalize(),
          ],
          sourceMap: isEnvProduction ? shouldUseSourceMap : isEnvDevelopment,
        },
      },
      // 自定义
      {
        loader: require.resolve('less-loader'),
      },
    ].filter(Boolean);
    if (preProcessor) {
      loaders.push(
          {
            loader: require.resolve('resolve-url-loader'),
            options: {
              sourceMap: isEnvProduction ? shouldUseSourceMap : isEnvDevelopment,
              root: paths.appSrc,
            },
          },
          // 自定义
          {
            loader: require.resolve(preProcessor),
            options: {
              ...otherLoaderOptions,
              sourceMap: true,
            },
          }
      );
    }
    return loaders;
  };
```

在 `module` --> `rules` --> `test: /\.(js|mjs|jsx|ts|tsx)$/,`下增加以下匹配逻辑


```
[
                    "react-css-modules",
                    {
                      generateScopedName: "[local]__[hash:base64:5]",
                      filetypes: {
                        ".less": {
                          syntax: "postcss-less",
                        },
                      },
                    },
],
```

在 `module` --> `rules` 下增加以下匹配逻辑

```
// 自定义, 匹配 less 规则 , 排除不使用styleName 的第三方代码
            {
              test: lessRegex,
              exclude: LibraryLessModulePaths,
              use: getStyleLoaders(
                  {
                    importLoaders: 2,
                    sourceMap: isEnvProduction
                        ? shouldUseSourceMap
                        : isEnvDevelopment,
                    modules: {
                      // localIdentName: '[name]__[local]___[hash:base64:5]',
                      getLocalIdent: (context, localIdentName, localName) => {
                        return generateScopedName(localName, context.resourcePath)
                      },
                    },
                  },
                  'less-loader',
                  {
                    lessOptions: {
                      javascriptEnabled: true,
                      modifyVars: theme,
                    }
                  }
              ),
            },
            // 自定义, 匹配 less 规则 , 第三方代码
            {
              test: lessRegexNoIdentName,
              include: LibraryLessModulePaths,
              use: getStyleLoaders(
                  {
                    importLoaders: 2,
                    sourceMap: isEnvProduction
                        ? shouldUseSourceMap
                        : isEnvDevelopment,
                  },
                  'less-loader',
                  {
                    lessOptions: {
                      javascriptEnabled: true,
                      modifyVars: theme,
                    }
                  }
              ),
            },
            // 自定义, 匹配 less 规则
            {
              test: lessModuleRegex,
              exclude: LibraryLessModulePaths,
              use: getStyleLoaders(
                  {
                    importLoaders: 2,
                    sourceMap: isEnvProduction
                        ? shouldUseSourceMap
                        : isEnvDevelopment,
                    modules: {
                      // localIdentName: '[name]__[local]___[hash:base64:5]',
                      getLocalIdent: (context, localIdentName, localName) => {
                        return generateScopedName(localName, context.resourcePath)
                      },
                    },
                  },
                  'less-loader',
                  {
                    lessOptions: {
                      javascriptEnabled: true,
                      modifyVars: theme,
                    }
                  }
              ),
            },
```

注意在 package.json 里 配置 react-css-modules

```
"plugins": [
      [
        "react-css-modules",
        {
          "context": "./src",
          "generateScopedName": "[local]__[hash:base64:5]",
          "webpackHotModuleReloading": true,
          "filetypes": {
            ".less": {
              "syntax": "postcss-less"
            }
          },
          "handleMissingStyleName": "throw",
          "autoResolveMultipleImports": true
        }
      ],
      "@babel/plugin-proposal-export-default-from",
      "@babel/plugin-proposal-optional-chaining",
      "@babel/plugin-proposal-nullish-coalescing-operator",
      [
        "@babel/plugin-proposal-decorators",
        {
          "legacy": true
        }
      ],
      [
        "import",
        {
          "libraryName": "antd",
          "libraryDirectory": "es",
          "style": true
        }
      ],
      [
        "prismjs",
        {
          "languages": [
            "javascript",
            "jsx",
            "css",
            "html"
          ],
          "plugins": [
            "line-numbers",
            "copy-to-clipboard",
            "show-language"
          ],
          "theme": "okaidia",
          "css": true
        }
      ]
    ]
```


## 2. 配置 resolve
```
// 自定义
'@ant-design': '@ant-design',
'@': paths.appSrc,
'src': paths.appSrc,
```

## 3. 路由读取配置

在 `module` --> `rules` 下增加以下匹配逻辑

```
//  自定义, 路由读取配置
        {
          test: /PageRoutes\.js$/,
          enforce: 'pre',
          use: path.resolve(paths.appSrc, 'routers', 'routeLoader.js'),
          include: paths.appSrc,
        },
```

通过 routeLoader 将路由内容填充到/src/routes/PageRoutes.js文件 中

具体 配置方式查看 /src/routes/ 底下的 README.md