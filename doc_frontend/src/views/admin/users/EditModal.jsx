import React, {Component} from 'react';
import {Form, notification} from 'antd';
import FormElement from 'src/library/FormElement';
import config from 'src/utils/Hoc/configHoc';
import ModalContent from 'src/library/ModalHoc/ModalContent';
import { createUser, retrieveUser, updateUser } from 'src/apis/user';
import {messageDuration} from "src/config/settings"
import validationRule from 'src/utils/validationRule'

@config({
    modal: {
        title: props => props.isEdit ? '修改用户' : '添加用户',
        maskClosable: true
    },
})
class EditModal extends Component {
    state = {
        loading: false, // 页面加载loading
        data: {},       // 回显数据
    };

    componentDidMount() {
        const {isEdit} = this.props;

        if (isEdit) {
            this.fetchData();
        }
    }

    fetchData = () => {
        if (this.state.loading) return;
        const {id} = this.props;
        this.setState({loading: true});
        retrieveUser(id)
            .then(res => {
                const data = res.data;
                this.setState({data: data.results});
                this.form.setFieldsValue(data.results);
            }, error => {
                console.log(error.response);
            })
            .finally(() => this.setState({loading: false}));
    };

    handleSubmit = async () => {
        const values = await this.form.validateFields();
        if (this.state.loading) return;
        const {isEdit} = this.props;
        const {id} = this.props;
        const successTip = isEdit ? '修改成功！' : '添加成功！';
        this.setState({loading: true});
        if (isEdit){
            updateUser(id, values)
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
        } else {
            createUser(values)
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
        }

    };

    render() {
        const {isEdit, onCancel} = this.props;
        const {loading, data } = this.state;
        const formProps = {
            labelWidth: 100,
        };
        return (
            <ModalContent
                loading={loading}
                okText={isEdit ? "修改" : "保存"}
                cancelText="取消"
                resetText={isEdit ? null : "重置"}
                onOk={() => this.form.submit()}
                onCancel={onCancel}
                onReset={isEdit ? null : () => this.form.resetFields()}
            >
                <Form
                    ref={form => this.form = form}
                    onFinish={this.handleSubmit}
                    initialValues={data}
                >
                    {isEdit ? <FormElement {...formProps} type="hidden" name="id"/> : null}

                    <FormElement
                        {...formProps}
                        label="用户名"
                        name="username"
                        required
                        noSpace
                        disabled={isEdit}
                    />
                    {isEdit ?  null : <FormElement {...formProps} type="password" label="密码" name="password" required noSpace/>}
                    <FormElement
                        {...formProps}
                        label="昵称"
                        name="nickname"
                        required
                        noSpace
                    />
                    <FormElement
                        {...formProps}
                        type="email"
                        label="邮箱"
                        name="email"
                        required
                        noSpace
                        rules={[validationRule.email()]}
                    />
                    <FormElement
                        {...formProps}
                        type="mobile"
                        label="手机号码"
                        name="phone"
                        noSpace
                        rules={[validationRule.mobile()]}
                    />
                    <FormElement
                        {...formProps}
                        type="select"
                        label="性别"
                        name="gender"
                        options={[
                            {value: '男', label: '男'},
                            {value: '女', label: '女'},
                        ]}
                    />
                    <FormElement
                        {...formProps}
                        type="number"
                        label="年龄"
                        name="age"
                    />
                    <FormElement
                        {...formProps}
                        label="岗位职称"
                        name="title"
                        noSpace
                    />
                    <FormElement
                        {...formProps}
                        label="地址"
                        name="address"
                        noSpace
                    />
                    <FormElement
                        {...formProps}
                        type="textarea"
                        label="简介"
                        name="intro"
                        noSpace
                    />
                    <FormElement
                        {...formProps}
                        type="select"
                        label="是否管理员"
                        name="is_admin"
                        options={[
                            {value: true, label: '是'},
                            {value: false, label: '否'},
                        ]}
                    />
                </Form>
            </ModalContent>
        );
    }
}

export default EditModal;