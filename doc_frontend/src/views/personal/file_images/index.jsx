import React, {Component} from 'react';
import config from 'src/utils/Hoc/configHoc';
import FileImagesBase from "src/views/base/file_images"


@config({
    path: '/personal/attachments/images',
    title: {text: '我的图片', icon: 'picture'},
    breadcrumbs: [{key: 'image', text: '我的图片', icon: 'picture'}],
})
class FileImages extends Component {
    state = {
        personal: true,  // 是否个人中心
    };
    render() {
        const {
            personal,
        } = this.state;

        return (
            <FileImagesBase personal={personal} />
        );
    }
}

export default FileImages;