import React, {Component} from 'react';
// import {Form, notification} from 'antd';
// import FormElement from 'src/library/FormElement';
import config from 'src/utils/Hoc/configHoc';
import ModalContent from 'src/library/ModalHoc/ModalContent';
// import { createDocTag, retrieveDocTag, updateDocTag } from 'src/apis/doc';
// import {messageDuration} from "src/config/settings"


@config({
    modal: {
        title: '插入图片',
        maskClosable: true
    },
})
class ImageModal extends Component {
    state = {
        loading: false, // 页面加载loading
        data: {},       // 回显数据
    };

    componentDidMount() {

    }

    render() {
        const {isEdit, onCancel} = this.props;
        const {loading } = this.state;
        // const formProps = {
        //     labelWidth: 100,
        // };
        return (
            <ModalContent
                loading={loading}
                okText={isEdit ? "修改" : "保存"}
                cancelText="取消"
                onOk={() => this.form.submit()}
                onCancel={onCancel}
            >

            </ModalContent>
        );
    }
}

export default ImageModal;