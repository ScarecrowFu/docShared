import React, {Component} from 'react';
import config from 'src/utils/Hoc/configHoc';
import DocBase from "src/views/base/docs"



@config({
    path: '/personal/docs/cooperate_docs',
    title: {text: '协作文档', icon: 'file-text'},
    breadcrumbs: [{key: 'cooperate_doc', text: '协作文档', icon: 'file-text'}],
})
class CooperateDoc extends Component {
    state = {
        personal: false,
        cooperate: true,  // 是否协作
    };
    render() {
        const {
            personal,
            cooperate,
        } = this.state;

        return (
            <DocBase personal={personal} cooperate={cooperate}/>
        );
    }
}

export default CooperateDoc;