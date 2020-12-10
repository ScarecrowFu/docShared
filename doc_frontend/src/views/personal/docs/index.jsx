import React, {Component} from 'react';
import config from 'src/utils/Hoc/configHoc';
import DocBase from "src/views/base/docs"



@config({
    path: '/personal/docs/docs',
    title: {text: '我的文档', icon: 'file'},
    breadcrumbs: [{key: 'doc', text: '我的文档', icon: 'file'}],
})
class Doc extends Component {
    state = {
        personal: true,  // 是否个人中心
    };
    render() {
        const {
            personal,
        } = this.state;

        return (
            <DocBase personal={personal} />
        );
    }
}

export default Doc;