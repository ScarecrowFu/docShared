import React, {Component} from 'react';
import {Form, notification, Alert} from 'antd';
import FormElement from 'src/library/FormElement';
import config from 'src/utils/Hoc/configHoc';
import ModalContent from 'src/library/ModalHoc/ModalContent';
import {messageDuration} from "src/config/settings"
import {getUserList} from "../../../apis/user"
import {transferCDoc} from "../../../apis/c_doc"


@config({
    modal: {
        title: '转让文集',
        maskClosable: true
    },
})
class EditTransferModal extends Component {
    state = {
        loading: false, // 页面加载loading
        data: {},
        user_options: [],
    };

    componentDidMount() {
        this.handleUserOptions();
    }

    handleUserOptions = () => {
        getUserList({'not_page': true})
            .then(res => {
                const data = res.data;
                const user_options = [];
                data.results.forEach(function (item) {
                    user_options.push({'value': item.id, 'label': item.nickname})
                })
                this.setState({ user_options: user_options });
            }, error => {
                console.log(error.response);
            })
    }

    handleSubmit = (values) => {
        if (this.state.loading) return;
        const {id} = this.props;
        const successTip = '文集转让成功！' ;
        this.setState({loading: true});
        transferCDoc(id, values)
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
        const message =  (
            <div>
                <p>选择转让的用户并输入密码进行确认, 转让后该文集的创建者将修改为转让的用户</p>
            </div>

        );
        return (
            <ModalContent
                loading={loading}
                okText="修改"
                cancelText="取消"
                onOk={() => this.form.submit()}
                onCancel={onCancel}
            >
                <Form
                    ref={form => this.form = form}
                    onFinish={this.handleSubmit}
                    initialValues={data}
                >
                    <FormElement {...formProps} type="hidden" name="id"/>
                    <FormElement
                        {...formProps}
                        type="select"
                        label="用户"
                        name="transfer_user"
                        required
                        options={this.state.user_options}
                    />
                    <FormElement
                        {...formProps}
                        type="password"
                        label="密码确认"
                        name="password"
                        required
                    />
                </Form>
                <Alert
                    message="Tips"
                    description={message}
                    type="success"
                    showIcon
                    closable
                />
            </ModalContent>
        );
    }
}

export default EditTransferModal;