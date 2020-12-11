import React, {Component} from 'react';
import config from 'src/utils/Hoc/configHoc';
import FileAttachmentBase from "src/views/base/file_attachments"


@config({
    path: '/personal/attachments/attachments',
    title: {text: '我的附件', icon: 'upload'},
    breadcrumbs: [{key: 'attachment', text: '我的附件', icon: 'upload'}],
})
class FileAttachment extends Component {
    state = {
        personal: true,  // 是否个人中心
    };
    render() {
        const {
            personal,
        } = this.state;

        return (
            <FileAttachmentBase personal={personal} />
        );
    }
}

export default FileAttachment;