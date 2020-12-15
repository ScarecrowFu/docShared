import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Spin} from 'antd';
import {Helmet} from 'react-helmet';
import {withRouter} from 'react-router-dom';
import FrontHeader from 'src/layouts/Header/FrontHeader';
import {connect} from 'src/models';
import {PAGE_FRAME_LAYOUT} from 'src/models/settings';
import './FrontLayout.less';


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
            title,
            globalLoading,
            globalLoadingTip,
        } = this.props;

        const titleText = title?.text || title;
        const titleIsString = typeof titleText === 'string';

        return (
            <div styleName="base-frame" className="no-print">
                <Helmet title={titleIsString ? 'docShared ' + titleText : 'docShared '}/>
                <FrontHeader/>
                <div styleName="global-loading" style={{display: globalLoading ? 'block' : 'none'}}>
                    <Spin spinning size="large" tip={globalLoadingTip}/>
                </div>
            </div>
        );
    }
}

export default FrontLayout;
