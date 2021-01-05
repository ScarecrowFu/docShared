import React, {Component} from 'react';
import config from 'src/utils/Hoc/configHoc';
import './style.less'



@config({
    path: '/personal/use_help',
    title: {text: '使用手册', icon: 'shop'},
    breadcrumbs: [{key: 'use_help', text: '使用手册', icon: 'shop'}],
})
class UseHelp extends Component {
    state = {
        personal: true,  // 是否个人中心
    };
    render() {
        return (
            <div>
                <div styleName="right">
                    <div styleName="right-inner">
                        <div styleName="code">404</div>
                        <div styleName="message">当前尚无使用手册说明</div>
                    </div>
                </div>
            </div>
        );
    }
}

export default UseHelp;