import React, {Component} from 'react';
import {Form, notification} from 'antd';
import FormElement from 'src/library/FormElement';
import config from 'src/utils/Hoc/configHoc';
import ModalContent from 'src/library/ModalHoc/ModalContent';
import { createFileGroup } from 'src/apis/file';
import {messageDuration} from "src/config/settings"


@config({
    modal: {
        title: '添加分组',
        maskClosable: true
    },
})
class AddGroupModal extends Component {
    state = {
        loading: false, // 页面加载loading
        group_type: 10,       // 分组类型
        data: {},       // 回显数据
    };

    componentDidMount() {
        const {group_type} = this.props;
        this.setState({group_type: group_type});
    }

    handleSubmit = (values) => {
        if (this.state.loading) return;
        const {group_type} = this.props;
        const successTip = '添加成功！';
        this.setState({loading: true});
        let params = {
            ...values,
            group_type: group_type
        };
        createFileGroup(params)
            .then(res => {
                const data = res.data;
                const {onOk} = this.props;
                onOk && onOk();
                notification.success({
                    message: successTip,
                    description: data.messages,
                    duration: messageDuration,
                });
            }, error => {
                console.log(error.response);
            })
            .finally(() => this.setState({loading: false}));

    };

    render() {
        const {onCancel} = this.props;
        const {loading, data } = this.state;
        const formProps = {
            labelWidth: 100,
        };
        return (
            <ModalContent
                loading={loading}
                okText="保存"
                cancelText="取消"
                onOk={() => this.form.submit()}
                onCancel={onCancel}
            >
                <Form
                    ref={form => this.form = form}
                    onFinish={this.handleSubmit}
                    initialValues={data}
                >
                    <FormElement
                        {...formProps}
                        label="名称"
                        name="name"
                        required
                        noSpace
                    />
                </Form>
            </ModalContent>
        );
    }
}

export default AddGroupModal;