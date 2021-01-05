import React, {Component} from 'react';
import config from 'src/utils/Hoc/configHoc';
import PageContent from "src/layouts/PageContent"
import './style.less'
import SetBase from './setBase'
import {Alert} from "antd"


@config({
    path: '/admin/setting/mailbox_set',
    title: {text: '邮箱设置', icon: 'mail'},
    breadcrumbs: [{key: 'mailbox_set', text: '邮箱设置', icon: 'mail'}],
})
class EmailSet extends Component {
    state = {
        set_classify: 'EmailSet',
    };

    render() {
        return (
            <PageContent>
                <Alert
                    message="Tips"
                    description="该配置暂未生效, 后续将完善"
                    type="warning"
                    showIcon
                    closable
                />
                <SetBase set_classify={this.state.set_classify}/>
            </PageContent>

        );
    }
}

export default EmailSet;