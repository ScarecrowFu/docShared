import React, {Component} from 'react';
import {Helmet} from 'react-helmet';
import {Input, Button, Form, Spin, Alert, Result, notification} from 'antd';
import {LockOutlined, UserOutlined} from '@ant-design/icons';
import {toLogin} from 'src/utils/userAuth';
import config from 'src/utils/Hoc/configHoc';
import Banner from './banner/index';
import {ResetPassword, Validation} from 'src/apis/user'
import './style.less';
import {ROUTE_BASE_NAME} from "src/routers/AppRouter"
import {messageDuration} from "src/config/settings"


@config({
    path: '/validation/:code',
    noFrame: true,
    noAuth: true,
})
class ValidationCode extends Component {
    state = {
        loading: false,
        message: '',
        code: '',
        verification_info: {},
        verify_status: 10, //0: 验证信息错误 10: 验证中 20: 验证成功
        isMount: false,
    };

    componentDidMount() {
        const params = this.props.match.params;
        const code = params.code;
        this.setState({code: code});
        this.handleValidateCode();
        setTimeout(() => this.setState({isMount: true}), 300);
    }

    handleValidateCode = () => {
        if (this.state.loading) return;
        const params = this.props.match.params;
        const code = params.code;
        this.setState({loading: true, message: ''});
        Validation({'code': code})
            .then(res => {
                const data = res.data
                notification.success({
                    message: '验证码正确',
                    description: data.messages,
                    duration: messageDuration,
                });
                this.setState({verification_info: data.results});
                this.setState({message: data.messages});
                this.setState({verify_status: 20});
                // setTimeout(() => toLogin(), 3000);
            }, error => {
                this.setState({verify_status: 0});
                console.log(error.response)
            })
            .catch(() => this.setState({message: '信息错误！', verify_status: 0}))
            .finally(() => this.setState({loading: false}));
    }

    handleSubmit = async () => {
        if (this.state.loading) return;
        const values = await this.form.validateFields();
        this.setState({loading: true, message: ''});
        let params = {
            ...values,
            code: this.state.code
        }
        ResetPassword(params)
            .then(res => {
                const data = res.data
                notification.success({
                    message: '重置密码成功',
                    description: data.messages,
                    duration: messageDuration,
                });
                this.setState({message: data.messages});
                setTimeout(() => toLogin(), 3000);
            }, error => {
                console.log(error.response)
            })
            .catch(() => this.setState({message: '信息错误！'}))
            .finally(() => this.setState({loading: false}));

    };

    render() {
        const {loading, message, isMount, verification_info, verify_status} = this.state;
        const {email_name, verification_type, verification_code, creator} = verification_info;
        const formItemStyleName = isMount ? 'form-item active' : 'form-item';
        const title = verification_type === 10 ? '激活注册用户' : '重置密码'
        return (
            <div styleName="root" className="login-bg">
                <Helmet title={title}/>
                <div styleName="left">
                    <Banner/>
                </div>
                <div styleName="right">
                    {
                        verify_status === 0?
                            <Result
                                status="404"
                                title="无效"
                                subTitle="Sorry, 当前验证码无效或不正确."
                                extra={[
                                    <Button type="primary" onClick={ () => window.location.href =  `${ROUTE_BASE_NAME}/login`}>返回登录</Button>
                                ]}
                            />
                            :
                            verify_status=== 10?
                                <Spin tip="Loading..." spinning={loading} >
                                    <Result
                                        title="正在验证"
                                        extra={[
                                            <Button type="primary" onClick={ () => window.location.href =  `${ROUTE_BASE_NAME}/login`}>返回登录</Button>
                                        ]}
                                    />
                                </Spin>
                                :
                                verify_status=== 20?
                                    verification_type === 10?
                                        <div>
                                            {loading?
                                                <Spin tip="Loading..." spinning={loading} >
                                                    <Alert
                                                        message="正在激活用户"
                                                        description={creator?.user?.username}
                                                        type="info"
                                                    />
                                                </Spin>
                                                :
                                                <Result
                                                    status="success"
                                                    title="成功激活"
                                                    subTitle={message}
                                                    extra={[
                                                        <Button type="primary" onClick={ () => window.location.href =  `${ROUTE_BASE_NAME}/login`}>返回登录</Button>
                                                    ]}
                                                />
                                            }
                                        </div>
                                        :
                                        verification_type === 20?
                                            <div styleName="box">
                                                <div styleName="error-tip">{message}</div>
                                                <Form
                                                    ref={form => this.form = form}
                                                    name="login"
                                                    className='inputLine'
                                                    onFinish={this.handleSubmit}
                                                >
                                                    <div styleName={formItemStyleName}>
                                                        <div styleName="header">{title}</div>
                                                    </div>

                                                    <div styleName={formItemStyleName}>
                                                        <Form.Item
                                                            name="username"
                                                        >
                                                            <Input
                                                                allowClear
                                                                autoFocus
                                                                prefix={<UserOutlined className="site-form-item-icon"/>}
                                                                placeholder="用户名"
                                                                defaultValue={creator?.username}
                                                                disabled
                                                            />
                                                        </Form.Item>
                                                    </div>

                                                    <div styleName={formItemStyleName}>
                                                        <Form.Item
                                                            name="email"
                                                        >
                                                            <Input prefix={<LockOutlined className="site-form-item-icon"/>} placeholder="邮箱" defaultValue={email_name} disabled/>
                                                        </Form.Item>
                                                    </div>

                                                    <div styleName={formItemStyleName}>
                                                        <Form.Item
                                                            name="username"
                                                        >
                                                            <Input allowClear autoFocus prefix={<UserOutlined className="site-form-item-icon"/>} placeholder="验证码"  defaultValue={verification_code} disabled/>
                                                        </Form.Item>
                                                    </div>

                                                    <div styleName={formItemStyleName}>
                                                        <Form.Item
                                                            name="password"
                                                            rules={[{required: true, message: '请输入密码'}]}
                                                        >
                                                            <Input.Password prefix={<LockOutlined className="site-form-item-icon"/>} placeholder="密码"/>
                                                        </Form.Item>
                                                    </div>

                                                    <div styleName={formItemStyleName}>
                                                        <Form.Item
                                                            name="confirm_password"
                                                            rules={[
                                                                {required: true, message: '请输入确认密码'},
                                                                ({ getFieldValue }) => ({
                                                                    validator(rule, value) {
                                                                        if (!value || getFieldValue('password') === value) {
                                                                            return Promise.resolve();
                                                                        }
                                                                        return Promise.reject('两次密码不相同');
                                                                    },
                                                                }),
                                                            ]}
                                                        >
                                                            <Input.Password prefix={<LockOutlined className="site-form-item-icon"/>} placeholder="确认密码"/>
                                                        </Form.Item>
                                                    </div>

                                                    <div styleName={formItemStyleName}>
                                                        <Form.Item shouldUpdate={true} style={{marginBottom: 12}}>
                                                            {() => (
                                                                <Button
                                                                    styleName="submit-btn"
                                                                    loading={loading}
                                                                    type="primary"
                                                                    htmlType="submit"
                                                                    disabled={
                                                                        this.form?.getFieldsError().filter(({errors}) => errors.length).length
                                                                    }
                                                                >
                                                                    重置密码
                                                                </Button>
                                                            )}
                                                        </Form.Item>
                                                    </div>

                                                    <div styleName={formItemStyleName}>
                                                        <Button type="link" onClick={ () => window.location.href =  `${ROUTE_BASE_NAME}/`}>首 页</Button>
                                                        <Button type="link" onClick={ () => window.location.href =  `${ROUTE_BASE_NAME}/login`}>返回登录</Button>
                                                    </div>

                                                </Form>
                                            </div> :
                                            <Result
                                                status="warning"
                                                title="未知"
                                                subTitle="Sorry, 当前验证码类型无法处理."
                                                extra={[
                                                    <Button type="primary" onClick={ () => window.location.href =  `${ROUTE_BASE_NAME}/login`}>返回登录</Button>
                                                ]}
                                            />
                                    :
                                    <Result
                                        status="warning"
                                        title="未知"
                                        subTitle="Sorry, 当前验证码状态无法处理."
                                        extra={[
                                            <Button type="primary" onClick={ () => window.location.href =  `${ROUTE_BASE_NAME}/login`}>返回登录</Button>
                                        ]}
                                    />
                    }
                </div>

            </div>
        );
    }
}

export default ValidationCode;

