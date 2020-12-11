import React, {Component} from 'react';
import config from 'src/utils/Hoc/configHoc';
import {Button, Form, notification} from "antd"
import PageContent from "src/layouts/PageContent"
import FormElement from "src/library/FormElement"
import validationRule from "src/utils/validationRule"
import {getInfo, updateUser} from "src/apis/user"
import {messageDuration} from "src/config/settings"
import './style.less'

@config({
    path: '/personal/setting/personal_set',
    title: {text: '个人信息', icon: 'radius-setting'},
    breadcrumbs: [{key: 'personal_set', text: '个人信息', icon: 'radius-setting'}],
})
class PersonalSet extends Component {
    state = {
        loading: false, // 页面加载loading
        data: {},       // 回显数据
    };

    fetchData = () => {
        if (this.state.loading) return;
        this.setState({loading: true});
        getInfo()
            .then(res => {
                const data = res.data;
                this.setState({data: data.results});
                this.form.setFieldsValue(data.results);
            }, error => {
                console.log(error.response);
            })
            .finally(() => this.setState({loading: false}));
    };

    componentDidMount() {
        this.fetchData();
    }

    handleSubmit = async () => {
        const values = await this.form.validateFields();
        if (this.state.loading) return;
        const successTip = '修改成功！';
        this.setState({loading: true});
        updateUser(values.id, values)
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
                        label="用户名"
                        name="username"
                        required
                        noSpace
                        disabled
                        width={'80%'}
                    />

                    <FormElement
                        label="昵称"
                        name="nickname"
                        required
                        noSpace
                        width={'80%'}
                    />

                    <FormElement
                        type="email"
                        label="邮箱"
                        name="email"
                        required
                        noSpace
                        rules={[validationRule.email()]}
                        width={'80%'}
                    />

                    <FormElement
                        type="mobile"
                        label="手机号码"
                        name="phone"
                        noSpace
                        rules={[validationRule.mobile()]}
                        width={'80%'}
                    />

                    <FormElement
                        type="select"
                        label="性别"
                        name="gender"
                        options={[
                            {value: '男', label: '男'},
                            {value: '女', label: '女'},
                        ]}
                        width={'80%'}
                    />

                    <FormElement
                        type="number"
                        label="年龄"
                        name="age"
                        width={'80%'}
                    />

                    <FormElement
                        label="岗位职称"
                        name="title"
                        noSpace
                        width={'80%'}
                    />

                    <FormElement
                        label="地址"
                        name="address"
                        noSpace
                        width={'80%'}
                    />

                    <FormElement
                        type="textarea"
                        label="简介"
                        name="intro"
                        noSpace
                        width={'80%'}
                    />
                    <Form.Item >
                        <Button
                            type="primary"
                            htmlType="submit"
                        >保 存</Button>
                    </Form.Item>
                </Form>
            </PageContent>
        );
    }
}

export default PersonalSet;