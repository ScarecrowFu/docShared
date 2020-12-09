import React, {Component} from 'react';
import config from 'src/utils/Hoc/configHoc';
import PageContent from "src/layouts/PageContent"
import './style.less'
import SetBase from './setBase'


@config({
    path: '/admin/setting/website_set',
    title: {text: '站点信息', icon: 'setting'},
    breadcrumbs: [{key: 'website_set', text: '站点信息', icon: 'setting'}],
})
class WebsiteSet extends Component {
    state = {
        set_classify: 'WebsiteSet',
    };

    render() {
        return (
            <PageContent>
                <SetBase set_classify={this.state.set_classify}/>
            </PageContent>

        );
    }
}

export default WebsiteSet;