import React, {Component} from 'react';
import config from 'src/utils/Hoc/configHoc';
import PageContent from "src/layouts/PageContent"
import './style.less'
import SetBase from './setBase'
// import {Alert} from "antd"


@config({
    path: '/admin/setting/base_set',
    title: {text: '基础设置', icon: 'desktop'},
    breadcrumbs: [{key: 'base_set', text: '基础设置', icon: 'desktop'}],
})
class BaseSet extends Component {
    state = {
        set_classify: 'BaseSet',
    };

    render() {
        return (
            <PageContent>
                <SetBase set_classify={this.state.set_classify}/>
            </PageContent>

        );
    }
}

export default BaseSet;