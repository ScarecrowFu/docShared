import React, {Component} from 'react';
import {Alert} from 'antd';
// import FormElement from 'src/library/FormElement';
import config from 'src/utils/Hoc/configHoc';
import ModalContent from 'src/library/ModalHoc/ModalContent';
// import {getCExportSet, saveCExportSet} from 'src/apis/c_doc';
// import {messageDuration} from "src/config/settings"


@config({
    modal: {
        title: '导入文集',
        maskClosable: true
    },
})
class EditImport extends Component {
    state = {
        loading: false, // 页面加载loading
    };

    componentDidMount() {}
    render() {
        const {onCancel} = this.props;
        const {loading } = this.state;
        const message =  (
            <div>
                <p>导入文集: 暂未完成, 后续功能</p>
            </div>

        );
        return (
            <ModalContent
                loading={loading}
                okText="确定"
                cancelText="取消"
                onOk={() => this.form.submit()}
                onCancel={onCancel}
            >
                <Alert
                    message="Tips"
                    description={message}
                    type="warning"
                    showIcon
                    closable
                />
            </ModalContent>
        );
    }
}

export default EditImport;