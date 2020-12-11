import React, {Component} from 'react';
import config from 'src/utils/Hoc/configHoc';



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
           <h1> todo </h1>
        );
    }
}

export default UseHelp;