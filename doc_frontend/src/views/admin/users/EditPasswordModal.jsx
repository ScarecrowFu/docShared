import React, {Component} from 'react';
import {Form, notification} from 'antd';
import FormElement from 'src/library/FormElement';
import config from 'src/utils/Hoc/configHoc';
import ModalContent from 'src/library/ModalHoc/ModalContent';
import { resetPasswordUser } from 'src/apis/user';
import {messageDuration} from "src/config/settings"

@config({
    modal: {
        title: '重置密码',
        maskClosable: true
    },
})
class EditPasswordModal extends Component {
    state = {
        loading: false, // 页面加载loading
        data: {},       // 回显数据
    };

    componentDidMount() { }

    handleSubmit = async () => {
        const values = await this.form.validateFields();
        if (this.state.loading) return;
        const {id} = this.props;
        this.setState({loading: true});
        resetPasswordUser(id, values)
            .then(res => {
                const data = res.data;
                const {onOk} = this.props;
                onOk && onOk();
                notification.success({
                    message: '重置成功',
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
            width: 200,
        };
        return (
            <ModalContent
                loading={loading}
                okText="确定"
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
                        type="password"
                        label="新密码"
                        name="password"
                        required
                        noSpace
                        labelWidth={100}
                        width={'80%'}
                    />

                    <FormElement
                        {...formProps}
                        type="password"
                        label="确认新密码"
                        name="confirm_password"
                        required
                        noSpace
                        labelWidth={100}
                        width={'80%'}
                        rules={[
                            {
                                required: true,
                                message: '请输入新密码',
                            },
                            ({ getFieldValue }) => ({
                                validator(rule, value) {
                                    if (!value || getFieldValue('password') === value) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject('两次密码不相同');
                                },
                            }),
                        ]}
                    />
                </Form>
            </ModalContent>
        );
    }
}

export default EditPasswordModal;