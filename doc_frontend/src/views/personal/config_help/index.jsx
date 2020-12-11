import React, {Component} from 'react';
import config from 'src/utils/Hoc/configHoc';



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
           <h1> todo </h1>
        );
    }
}

export default ConfigHelp;