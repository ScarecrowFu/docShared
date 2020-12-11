import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Spin} from 'antd';
import {Helmet} from 'react-helmet';
import {withRouter} from 'react-router-dom';
import FrontHeader from 'src/layouts/Header/FrontHeader';
import {connect} from 'src/models';
import {PAGE_FRAME_LAYOUT} from 'src/models/settings';
import './FrontLayout.less';
import PageHead from "./PageHead"


@withRouter
@connect(state => {
    const {selectedMenu, menus} = state.menu;
    const {title, breadcrumbs, showHead} = state.page;
    const {show: showSide, width, collapsed, collapsedWidth, dragging} = state.side;
    const {loading, loadingTip, isMobile} = state.system;
    const {pageFrameLayout, pageHeadFixed, pageHeadShow, tabsShow} = state.settings;
    return {
        menus,
        selectedMenu,
        showPageHead: showHead,
        title,
        breadcrumbs,
        showSide,
        sideWidth: width,
        sideCollapsed: collapsed,
        sideCollapsedWidth: collapsedWidth,
        globalLoading: loading,
        globalLoadingTip: loadingTip,
        sideDragging: dragging,
        layout: pageFrameLayout,
        pageHeadFixed,
        pageHeadShow, // 设置中统一控制的头部是否显示
        tabsShow,
        isMobile,
    };
})
class FrontLayout extends Component {
    constructor(...props) {
        super(...props);
        this.props.action.getStateFromStorage();
    }

    static propTypes = {
        layout: PropTypes.string,
    };

    static defaultProps = {
        layout: PAGE_FRAME_LAYOUT.SIDE_MENU,    // top-menu side-menu
        pageHeadFixed: true,        // 页面头部是否固定
    };

    state = {};

    render() {
        let {
            layout,
            pageHeadFixed,
            showPageHead,
            tabsShow,
            title,
            breadcrumbs,

            showSide,
            sideCollapsed,
            sideCollapsedWidth,
            sideWidth,
            globalLoading,
            globalLoadingTip,
            sideDragging,
            isMobile,
        } = this.props;

        sideWidth = sideCollapsed ? sideCollapsedWidth : sideWidth;
        sideWidth = showSide ? sideWidth : 0;

        let transitionDuration = sideDragging ? '0ms' : `300ms`;

        const isTopSideMenu = layout === PAGE_FRAME_LAYOUT.TOP_SIDE_MENU;
        const isSideMenu = layout === PAGE_FRAME_LAYOUT.SIDE_MENU;
        const hasSide = isTopSideMenu || isSideMenu;

        if (!hasSide) {
            window.document.body.style.paddingLeft = '0px';
        } else {
            window.document.body.style.paddingLeft = `${sideWidth}px`;
        }

        const theme = 'default'; // (isTopSideMenu || isSideMenu) ? 'dark' : 'default';

        if (isMobile) {
            showPageHead = true;
            pageHeadFixed = true;
            tabsShow = false;
        }
        let pageHead = null;
        if (showPageHead) {
            pageHead = (
                <PageHead
                    title={title}
                    breadcrumbs={breadcrumbs}
                />
            );

            if (pageHeadFixed) {
                pageHead = (
                    <div className="frame-page-head-fixed" styleName={`page-head-fixed ${tabsShow ? 'with-tabs' : ''}`} style={{left: hasSide ? sideWidth : 0, transitionDuration}}>
                        {pageHead}
                    </div>
                );
            }
        }

        if (isSideMenu && !isMobile) pageHead = null;

        const titleText = title?.text || title;
        const titleIsString = typeof titleText === 'string';

        const topSpaceClass = ['content-top-space'];

        if (showPageHead && pageHead && pageHeadFixed) topSpaceClass.push('with-fixed-page-head');
        if (tabsShow) topSpaceClass.push('with-tabs');

        const windowWidth = window.innerWidth;
        const sideWidthSpace = hasSide ? sideWidth : 0;

        return (
            <div styleName="base-frame" className="no-print">
                <Helmet title={titleIsString ? 'docShared ' + titleText : 'docShared '}/>
                <FrontHeader/>
                {/*<div styleName={topSpaceClass.join(' ')} className={topSpaceClass.join(' ')}/>*/}
                {/*{pageHead}*/}
                {/*{tabsShow ? <div styleName="page-tabs" id="frame-page-tabs" style={{left: sideWidthSpace, width: windowWidth - sideWidthSpace, transitionDuration}}><PageTabs width={windowWidth - sideWidthSpace}/></div> : null}*/}
                <div styleName="global-loading" style={{display: globalLoading ? 'block' : 'none'}}>
                    <Spin spinning size="large" tip={globalLoadingTip}/>
                </div>
            </div>
        );
    }
}

export default FrontLayout;
