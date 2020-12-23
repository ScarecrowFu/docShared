import React, {Component} from 'react';
import {
    notification,
    Form, Alert,
} from 'antd';
import FormElement from 'src/library/FormElement';
import config from 'src/utils/Hoc/configHoc';
import ModalContent from 'src/library/ModalHoc/ModalContent';
import {validCDocPermValue} from 'src/apis/c_doc';
import {messageDuration} from "src/config/settings"


@config({
    modal: {
        title: '输入访问码',
        maskClosable: true
    },
})
class ValidPermModal extends Component {
    state = {
        loading: false, // 页面加载loading
    };

    componentDidMount() {}

    handleSubmit = async () => {
        if (this.state.loading) return;
        const values = await this.form.validateFields();
        const {id} = this.props;
        this.setState({loading: true});
        validCDocPermValue(id, values)
            .then(res => {
                const data = res.data;
                const {onOk} = this.props;
                onOk && onOk();
                notification.success({
                    message: '访问码正确',
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
        const {loading } = this.state;
        const formProps = {
            labelWidth: 80,
        };
        return (
            <ModalContent
                loading={loading}
                okText="确认"
                cancelText="关 闭"
                onOk={() => this.form.submit()}
                onCancel={onCancel}
            >
                <Form
                    ref={form => this.form = form}
                    onFinish={this.handleSubmit}
                >
                    <FormElement {...formProps} type="hidden" name="id"/>
                    <FormElement
                        {...formProps}
                        label="访问码"
                        name="perm_value"
                        required
                        noSpace
                    />
                </Form>
                <Alert
                    message="Tips"
                    description="当前文集为访问码可见, 请输入正确的访问码"
                    type="success"
                    showIcon
                    closable
                />
            </ModalContent>
        );
    }
}

export default ValidPermModal;