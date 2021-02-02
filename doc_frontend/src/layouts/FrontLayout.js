import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Spin} from 'antd';
// import {Helmet} from 'react-helmet';
import {withRouter} from 'react-router-dom';
import Header from 'src/layouts/Header';
import {connect} from 'src/models';
import {PAGE_FRAME_LAYOUT} from 'src/models/settings';
import './FrontLayout.less';
import CustomHelmet from "src/layouts/Helmet"

@withRouter
@connect(state => {
    const {title} = state.page;
    return {
        title
    };
})
class FrontLayout extends Component {
    state = {};

    constructor(...props) {
        super(...props);
        // console.log('front constructor');
        // 从Storage中获取出需要同步到redux的数据
        this.props.action.getStateFromStorage();
    }

    static propTypes = {
        layout: PropTypes.string,
    };

    static defaultProps = {
        layout: PAGE_FRAME_LAYOUT.SIDE_MENU,    // top-menu side-menu
        pageHeadFixed: true,        // 页面头部是否固定
    };


    render() {
        let {
            title,
            globalLoading,
            globalLoadingTip,
        } = this.props;

        const titleText = title?.text || title;
        // const titleIsString = typeof titleText === 'string';

        return (
            <div styleName="base-frame" className="no-print">
                {/*<Helmet title={titleIsString ? 'docShared ' + titleText : 'docShared '}/>*/}
                <CustomHelmet request={true} titleText={titleText}/>
                <Header headerType="front"/>
                <div styleName="global-loading" style={{display: globalLoading ? 'block' : 'none'}}>
                    <Spin spinning size="large" tip={globalLoadingTip}/>
                </div>
            </div>
        );
    }
}

export default FrontLayout;
