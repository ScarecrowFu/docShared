import React, {Component} from 'react';
import config from 'src/utils/Hoc/configHoc';
import DocRecycleBase from "../../base/docs_recycle"


@config({
    path: '/admin/docs/recycle',
    title: {text: '回收站管理', icon: 'file-protect'},
    breadcrumbs: [{key: 'recycle', text: '回收站管理', icon: 'file-protect'}],
})
class DocRecycle extends Component {
    state = {
        personal: false,  // 是否个人中心
    };
    render() {
        const {
            personal,
        } = this.state;

        return (
            <DocRecycleBase personal={personal} />
        );
    }
}

export default DocRecycle;