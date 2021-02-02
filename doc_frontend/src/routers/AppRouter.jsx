import React, {Component} from 'react';
import {BrowserRouter, Route, Switch} from 'react-router-dom';
import {isLogin} from 'src/utils/userAuth';
import BasicLayout from 'src/layouts/BasicLayout';
import FrontLayout from 'src/layouts/FrontLayout';
import Error404 from 'src/components/Error/Error404';
import config from 'src/utils/Hoc/configHoc';
import KeepAuthRoute from './KeepAuthRoute';
import KeepPage from './KeepPage';
import {getUrlIndexName} from 'src/utils'
import routes, {noFrameRoutes, noAuthRoutes /*commonPaths*/} from './routes';


// 直接挂载到域名根目录
export const ROUTE_BASE_NAME = process.env.BASE_NAME || '';

@config({
    query: true,
    connect: state => ({userPaths: state.system.userPaths, systemNoFrame: state.system.noFrame}),
})
class AppRouter extends Component {

    /**
     * allRoutes为全部路由配置，根据用户可用 菜单 和 功能 的path，对allRoutes进行过滤，可以解决越权访问页面的问题
     * commonPaths 为所有人都可以访问的路径 在.routes中定义
     * @returns {{path: *, component: *}[]}
     */
    getUserRoutes = () => {
        // const {userPaths} = this.props;
        // const allPaths = [...userPaths, ...commonPaths];
        // return routes.filter(item => allPaths.includes(item.path));
        // const pathname = window.location.pathname;
        // return routes;
        // 路由配置需要与当前菜单保持一致
        const index_name = getUrlIndexName(window.location.pathname);
        if (index_name === '/admin' || index_name === '/personal') {
            return routes.filter(item => item.path.startsWith(index_name));
        } else {
            return routes.filter(item => !item.path.startsWith('/admin') && !item.path.startsWith('/personal'));
        }


    };

    render() {
        const {noFrame: queryNoFrame, noAuth} = this.props.query;
        const {systemNoFrame} = this.props;
        const userRoutes = this.getUserRoutes();
        // console.log('AppRouter render: isLogin', isLogin())
        return (
            <BrowserRouter basename={ROUTE_BASE_NAME}>
                <div style={{display: 'flex', flexDirection: 'column', position: 'relative', minHeight: '100vh'}}>
                    <Route path="/" render={props => {
                        const pathname = window.location.pathname
                        if (pathname.startsWith('/admin') || pathname.startsWith('/personal') ) {
                            // 框架组件单独渲染，与其他页面成为兄弟节点，框架组件和具体页面组件渲染互不影响
                            if (systemNoFrame) return null;
                            // 通过配置，筛选那些页面不需要框架
                            if (noFrameRoutes.includes(props.location.pathname)) return null;

                            // 框架内容属于登录之后内容，如果未登录，也不显示框架
                            if (!isLogin()) return null;

                            // 如果浏览器url中携带了noFrame=true参数，不显示框架
                            if (queryNoFrame === 'true') return null;
                            return <BasicLayout {...props}/>;
                        } else {
                            if (pathname.startsWith('/login') ||
                                pathname.startsWith('/register') ||
                                pathname.startsWith('/forget_password') ||
                                pathname.startsWith('/validation'))
                            {
                                return null;
                            }
                            return <FrontLayout {...props}/>;
                            // return <BasicLayout {...props}/>;
                        }

                    }}/>
                    <Route exact path={userRoutes.map(item => item.path)}>
                        {/*{console.log("AppRouter Route KeepPage", userRoutes)}*/}
                        <KeepPage/>
                    </Route>
                    <Switch>
                        {/*{console.log("AppRouter Switch userRoutes map return KeepAuthRoute", userRoutes)}*/}
                        {userRoutes.map(item => {
                            const {path, component} = item;
                            let isNoAuthRoute = false;

                            // 不需要登录的页面
                            if (noAuthRoutes.includes(path)) isNoAuthRoute = true;

                            // 如果浏览器url中携带了noAuthor=true参数，不需要登录即可访问
                            if (noAuth === 'true') isNoAuthRoute = true;
                            return (
                                <KeepAuthRoute
                                    key={path}
                                    exact
                                    path={path}
                                    noAuth={isNoAuthRoute}
                                    component={component}
                                />
                            );
                        })}
                        <Route component={Error404}/>
                    </Switch>
                </div>
            </BrowserRouter>
        );
    }
}

export default AppRouter;
