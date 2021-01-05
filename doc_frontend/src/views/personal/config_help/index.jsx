import React, {Component} from 'react';
import config from 'src/utils/Hoc/configHoc';
import './style.less'



@config({
    path: '/personal/config_help',
    title: {text: '配置手册', icon: 'gift'},
    breadcrumbs: [{key: 'config_help', text: '配置手册', icon: 'gift'}],
})
class ConfigHelp extends Component {
    state = {
        personal: true,  // 是否个人中心
    };
    render() {
        return (
            <div>
                <div styleName="right">
                    <div styleName="right-inner">
                        <div styleName="code">404</div>
                        <div styleName="message">当前尚无配置手册说明</div>
                    </div>
                </div>
            </div>
        );
    }
}

export default ConfigHelp;