import React, {Component} from 'react';
import config from 'src/utils/Hoc/configHoc';
import DocTagBase from "src/views/base/doc_tags"



@config({
    path: '/admin/docs/tags',
    title: {text: '标签管理', icon: 'tag'},
    breadcrumbs: [{key: 'tag', text: '标签管理', icon: 'tag'}],
})
class DocTag extends Component {
    state = {
        personal: false,  // 是否个人中心
    };
    render() {
        const {
            personal,
        } = this.state;

        return (
            <DocTagBase personal={personal} />
        );
    }
}

export default DocTag;