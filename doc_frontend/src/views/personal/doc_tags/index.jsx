import React, {Component} from 'react';
import config from 'src/utils/Hoc/configHoc';
import DocTagBase from "src/views/base/doc_tags"



@config({
    path: '/personal/docs/tags',
    title: {text: '我的标签', icon: 'tag'},
    breadcrumbs: [{key: 'tag', text: '我的标签', icon: 'tag'}],
})
class DocTag extends Component {
    state = {
        personal: true,  // 是否个人中心
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