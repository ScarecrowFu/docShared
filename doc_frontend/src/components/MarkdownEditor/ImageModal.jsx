import React, {Component} from 'react';
import config from 'src/utils/Hoc/configHoc';
import ModalContent from 'src/library/ModalHoc/ModalContent';
import {Image, Tabs} from "antd"


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
        const { TabPane } = Tabs;
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
                <Tabs defaultActiveKey="select">
                    <TabPane tab="选择图片" key="select">
                        <Image
                            width={200}
                            src="https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png"
                        />
                    </TabPane>
                    <TabPane tab="上传图片" key="upload">
                        ttt
                    </TabPane>
                    <TabPane tab="插入外链图片" key="link">
                        ttt
                    </TabPane>
                </Tabs>
            </ModalContent>
        );
    }
}

export default ImageModal;