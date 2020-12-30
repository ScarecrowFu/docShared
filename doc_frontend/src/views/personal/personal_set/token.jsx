import React, {Component} from 'react';
import config from 'src/utils/Hoc/configHoc';
import {Alert, Button, Form, notification} from "antd"
import PageContent from "src/layouts/PageContent"
import FormElement from "src/library/FormElement"
import { getTokenUser, refreshTokenUser} from "src/apis/user"
import {messageDuration} from "src/config/settings"
import './style.less'

@config({
    path: '/personal/setting/token_set',
    title: {text: '账号token', icon: 'gold'},
    breadcrumbs: [{key: 'token_set', text: '账号token', icon: 'gold'}],
})
class PersonalSet extends Component {
    state = {
        loading: false, // 页面加载loading
        data: {},       // 回显数据
    };
    fetchData = () => {
        if (this.state.loading) return;
        this.setState({loading: true});
        getTokenUser()
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
        const successTip = 'token更换！';
        this.setState({loading: true});
        refreshTokenUser(values)
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
                        label="token"
                        name="token"
                        required
                        noSpace
                        disabled
                        width={'80%'}
                    />

                    <Form.Item >
                        <Button
                            type="primary"
                            htmlType="submit"
                        >刷新token</Button>
                    </Form.Item>
                    <Alert
                        message="Tips"
                        description="借助Token，你可以无需打开网站，直接通过更加自动化的方式进行文档编写"
                        type="success"
                        showIcon
                        closable
                        width={'80%'}
                    />
                    <Alert
                        message="Tips"
                        description="刷新Token暂无效, 后续完善"
                        type="warning"
                        showIcon
                        closable
                        width={'80%'}
                    />
                </Form>
            </PageContent>
        );
    }
}

export default PersonalSet;