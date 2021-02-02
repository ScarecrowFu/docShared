import React from 'react';
import {Route} from 'react-router-dom';
import {isLogin, toLogin} from 'src/utils/userAuth';
import config from 'src/utils/Hoc/configHoc';
import {keepAliveRoutes} from './routes';

/**
 * 与KeepPage配合使用的路由，进行页面的收集
 */
@config({
    pubSub: true,
    connect(state) {
        return {
            tabs: state.system.tabs,
            title: state.page.title,
            selectedMenu: state.menu.selectedMenu,
            keepAliveSystem: state.system.keepAlive,
            tabsShow: state.settings.tabsShow,
        };
    },
})
class KeepAuthRoute extends React.Component {
    componentDidUpdate() {
        // console.log('KeepAuthRoute componentDidUpdate');
        if (this.tabsChange) {
            this.tabsChange = false;
            this.props.action.system.setTabs(this.tabs);
            // console.timeEnd('active');
            // console.log('KeepAuthRoute componentDidUpdate tabsChange')
        }
    }

    render() {
        const {
            component: Component,
            noAuth,
            tabs,
            keepAliveSystem,
            tabsShow,
            ...rest
        } = this.props;

        return (
            <Route
                {...rest}
                render={props => {
                    const configKeepAlive = keepAliveRoutes.find(item => item.path === rest.path)?.keepAlive;
                    const keepAlive = configKeepAlive === void 0 ? keepAliveSystem : configKeepAlive;
                    const {history} = props;
                    const {action: {system}} = this.props;

                    if (!noAuth && !isLogin()) return toLogin();

                    let component = <Component {...props}/>;

                    // 如果页面现实tabs，或者有页面启用了keepAlive 需要对tabs进行操作
                    if (tabsShow || keepAlive || keepAliveRoutes.length) {
                        const {pathname, search} = props.location;
                        const currentPath = window.decodeURIComponent(`${pathname}${search}`);

                        let currentTab = tabs.find(item => item.path === currentPath);
                        let nextActiveTab = tabs.find(item => item.nextActive);
                        let prevActiveTab = tabs.find(item => item.active);

                        // 根据nextActive标记切换新的tab页
                        if (nextActiveTab) {
                            nextActiveTab.nextActive = false;
                            setTimeout(() => {
                                const iframePagePrefix = '/iframe_page_/';
                                let path = nextActiveTab.path;
                                if (path.startsWith(iframePagePrefix)) {
                                    path = `${iframePagePrefix}${window.encodeURIComponent(path.replace(iframePagePrefix, ''))}`;
                                }
                                history.push(path);
                            });
                            return keepAlive ? null : component;
                        }

                        // 获取当前地址对应的标签页
                        const TabComponent = keepAlive ? component : null;

                        // 切换tab页
                        if (currentTab && !currentTab.active) {
                            // 保存上一个tab页滚动调位置

                            // 记录上一个页面的滚动条位置
                            if (prevActiveTab) {
                                // console.log("KeepAuthRoute 1 prevActiveTab 记录上一个页面的滚动条位置");
                                prevActiveTab.scrollTop = document.body.scrollTop = document.documentElement.scrollTop;
                            }

                            // 清空选中状态
                            if (prevActiveTab) {
                                prevActiveTab.active = false;
                                this.props.publish('tab-hide', prevActiveTab.path);
                            }

                            currentTab.active = true;

                            this.props.publish('tab-show', currentTab.path);

                            // console.time('active');

                            // 在componentWillUpdate中执行 system.setTabs
                            // 加快tab页切换，开发：80ms左右，生产：10ms左右
                            // 避免 Warning: Cannot update during an existing state transition (such as within `render`). Render methods should be a pure function of props and state.
                            this.tabsChange = true;
                            this.tabs = [...tabs];

                            // setTimeout(() => {
                            //     system.setTabs([...tabs]);
                            //     console.timeEnd('active'); // 开发：180ms左右，生产：20ms左右
                            // });
                        }

                        // 先让 KeepPage.jsx 进行一次 无component渲染，然后再次渲染component达到刷新的目的
                        if (keepAlive && currentTab && !currentTab.component) {
                            // console.log('KeepAuthRoute 先让 KeepPage.jsx 进行一次 无component渲染，然后再次渲染component达到刷新的目的')
                            setTimeout(() => {
                                currentTab.component = TabComponent;
                                system.setTabs([...tabs]);
                            });
                        }

                        // 添加一个标签 当前地址对应的tab页不存在，进行添加
                        if (!currentTab) {
                            let prevActiveIndex = -1;
                            const prevActiveTab = tabs.find((item, index) => {
                                if (item.active) prevActiveIndex = index;

                                return item.active;
                            });

                            // 记录上一个页面的滚动条位置
                            if (prevActiveTab) {
                                // console.log("KeepAuthRoute 2 prevActiveTab 记录上一个页面的滚动条位置");
                                prevActiveTab.scrollTop = document.body.scrollTop = document.documentElement.scrollTop;
                            }

                            // 清空选中状态 直接选中新添加的标签
                            if (prevActiveTab) prevActiveTab.active = false;
                            const newAddTab = {
                                path: currentPath,
                                component: TabComponent,
                                active: true,
                            };

                            // 用户新开tab页之后，往往比较关心上一个tab，新开的tab页面放在当前tab页面之后
                            if (prevActiveIndex !== -1) {
                                tabs.splice(prevActiveIndex + 1, 0, newAddTab);
                            } else {
                                tabs.push(newAddTab);
                            }

                            // 不使用setTimeout 会报出 Warning: Cannot update during an existing state transition (such as within `render`). Render methods should be a pure function of props and state.
                            setTimeout(() => {
                                // 等待title selectedMenu更新完成了之后，才获取；
                                newAddTab.text = this.props.title;
                                newAddTab.icon = this.props.selectedMenu?.icon;
                                system.setTabs([...tabs]);
                            });
                        }
                    }

                    // 由KeepPage组件进行页面渲染和切换，这里不需要进行页面渲染
                    // console.log('KeepAuthRoute 由KeepPage组件进行页面渲染和切换，这里不需要进行页面渲染');
                    if (keepAlive) return null;

                    // 页面滚动条滚动到顶部
                    // console.log("KeepAuthRoute 页面滚动条滚动到顶部");
                    document.body.scrollTop = document.documentElement.scrollTop = 0;
                    return component;
                }}
            />
        );
    }
}

export default KeepAuthRoute;
