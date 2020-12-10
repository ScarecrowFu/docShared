import React, {Component} from 'react';
import config from 'src/utils/Hoc/configHoc';
import CDocBase from 'src/views/base/c_docs';


@config({
    path: '/personal/c_docs/c_docs',
    title: {text: '我的文集', icon: 'file-word'},
    breadcrumbs: [{key: 'c_doc', text: '我的文集', icon: 'file-word'}],
})
class CDoc extends Component {
    state = {
        personal: true,  // 是否个人中心
    };
    render() {
        const {
            personal,
        } = this.state;

        return (
            <CDocBase personal={personal} />
        );
    }
}

export default CDoc;