import pageRoutes, {noAuths, noFrames, keepAlives} from './PageRoutes';
import PageLoading from 'src/layouts/PageLoading';
import loadable from '@loadable/component';
import React from 'react';

// 不需要页面框架的页面配置
export const noFrameRoutes = noFrames;

// 不需要登录的页面
export const noAuthRoutes = noAuths;

// 需要keep alive 页面
export const keepAliveRoutes = keepAlives;

// 所有人都可以访问的页面
export const commonPaths = [
    '/',
    '/login',
];

/*
* 非脚本抓取的路由，可以在这里编辑，脚本抓取的路由在./page-routes.js中
* */
export default [
    // {path: '/', component: ()=> import('./path-to-component')},
].concat(pageRoutes)
    .map(item => {
        return {
            path: item.path,
            component: loadable(item.component, {fallback: <PageLoading/>}),
        };
    });
