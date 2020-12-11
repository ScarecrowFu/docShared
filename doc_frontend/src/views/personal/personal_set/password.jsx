import React, {Component} from 'react';
import config from 'src/utils/Hoc/configHoc';
import {Button, Form, notification} from "antd"
import PageContent from "src/layouts/PageContent"
import FormElement from "src/library/FormElement"
import {passwordUser} from "src/apis/user"
import {messageDuration} from "src/config/settings"
import './style.less'

@config({
    path: '/personal/setting/password_set',
    title: {text: '修改密码', icon: 'gateway'},
    breadcrumbs: [{key: 'password_set', text: '修改密码', icon: 'gateway'}],
})
class PersonalSet extends Component {
    state = {
        loading: false, // 页面加载loading
        data: {},       // 回显数据
    };

    componentDidMount() {}

    handleSubmit = async () => {
        const values = await this.form.validateFields();
        if (this.state.loading) return;
        const successTip = '修改成功！';
        this.setState({loading: true});
        passwordUser(values)
            .then(res => {
                const data = res.data;
                const {onOk} = this.props;
                onOk && onOk();
                notification.success({
                    message: successTip,
                    description: data.messages,
                    duration: messageDuration,
                });
                this.form.resetFields();
            }, error => {
                console.log(error.response);
            })
            .finally(() => this.setState({loading: false}));

    };


    render() {
        const {data } = this.state;

        return (
            <PageContent>
                <Form
                    styleName="formItem"
                    ref={form => this.form = form}
                    layout="vertical"
                    name="sys_set"
                    onFinish={this.handleSubmit}
                    initialValues={data}
                >

                    <FormElement type="hidden" name="id"/>

                    <FormElement
                        type="password"
                        label="旧密码"
                        name="old_password"
                        required
                        noSpace
                        width={'80%'}
                    />

                    <FormElement
                        type="password"
                        label="新密码"
                        name="new_password"
                        required
                        noSpace
                        width={'80%'}
                    />

                    <FormElement
                        type="password"
                        label="确认新密码"
                        name="confirm_new_password"
                        required
                        noSpace
                        width={'80%'}
                    />

                    <Form.Item >
                        <Button
                            type="primary"
                            htmlType="submit"
                        >修改密码</Button>
                    </Form.Item>
                </Form>
            </PageContent>
        );
    }
}

export default PersonalSet;