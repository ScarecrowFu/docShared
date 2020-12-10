import React, {Component} from 'react';
import config from 'src/utils/Hoc/configHoc';
import CDocBase from 'src/views/base/c_docs';


@config({
    path: '/personal/c_docs/cooperate_c_docs',
    title: {text: '协作文集', icon: 'file-exclamation'},
    breadcrumbs: [{key: 'cooperate_c_doc', text: '协作文集', icon: 'file-exclamation'}],
})
class CooperateCDoc extends Component {
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
            <CDocBase personal={personal} cooperate={cooperate} />
        );
    }
}

export default CooperateCDoc;