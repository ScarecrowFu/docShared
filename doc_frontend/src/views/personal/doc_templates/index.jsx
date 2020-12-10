import React, {Component} from 'react';
import config from 'src/utils/Hoc/configHoc';
import DocTemplateBase from "../../base/doc_templates"



@config({
    path: '/personal/docs/templates',
    title: {text: '我的模板', icon: 'file-unknown'},
    breadcrumbs: [{key: 'template', text: '我的模板', icon: 'file-unknown'}],
})
class DocTemplate extends Component {
    state = {
        personal: true,  // 是否个人中心
    };
    render() {
        const {
            personal,
        } = this.state;

        return (
            <DocTemplateBase personal={personal} />
        );
    }
}

export default DocTemplate;