import React, {Component} from 'react';
import {Helmet} from 'react-helmet';
import {Input, Button, Form, notification, Modal} from 'antd';
import {LockOutlined, UserOutlined} from '@ant-design/icons';
import {toLogin} from 'src/utils/userAuth';
import config from 'src/utils/Hoc/configHoc';
import Banner from './banner/index';
import { register } from 'src/apis/user'
import './style.less';
import {ROUTE_BASE_NAME} from "src/routers/AppRouter";
import {getBaseSetInfo, setBaseSetInfoRequest} from 'src/utils/info';
import {messageDuration} from "src/config/settings";
import validationRule from "src/utils/validationRule";

@config({
    path: '/register',
    noFrame: true,
    noAuth: true,
})
class Register extends Component {
    state = {
        loading: false,
        message: '',
        isMount: false,
        isModalVisible: false,
        use_reg_code: false,
        can_register: false,
    };

    componentDidMount() {
        setTimeout(() => this.setState({isMount: true}), 300);
        this.handleBaseInfo();
    }

    handleBaseInfo = () => {
        const base_info = getBaseSetInfo();
        if (base_info) {
            const use_reg_code = base_info['use_reg_code'];
            const can_register = base_info['can_register'];
            this.setState({use_reg_code: use_reg_code});
            this.setState({can_register: can_register}, function () {
                if (!this.state.can_register) {
                    notification.error({
                        message: '不允许访问',
                        description: '当前不允许注册用户',
                        duration: messageDuration,
                    });
                    setTimeout(() => toLogin(), 3000);
                }
            });
        } else {
            setBaseSetInfoRequest().then(res => {
                const base_info = getBaseSetInfo();
                const use_reg_code = base_info['use_reg_code'];
                const can_register = base_info['can_register'];
                this.setState({use_reg_code: use_reg_code});
                this.setState({can_register: can_register}, function () {
                    if (!this.state.can_register) {
                        notification.error({
                            message: '不允许访问',
                            description: '当前不允许注册用户',
                            duration: messageDuration,
                        });
                        setTimeout(() => toLogin(), 3000);
                    }
                });
            }, error => {
                console.log(error.response);
            });
        }
    }

    handleSubmit = async () => {
        if (this.state.loading) return;
        const values = await this.form.validateFields();
        this.setState({loading: true, message: ''});
        register(values)
            .then(res => {
                const data = res.data
                notification.success({
                    message: '注册成功',
                    description: data.messages,
                    duration: messageDuration,
                });
                this.setState({message: data.messages});
                this.setState({isModalVisible: true});
                // setTimeout(() => toLogin(), 3000);
            }, error => {
                console.log(error.response)
            })
            .catch(() => this.setState({message: '信息错误！'}))
            .finally(() => this.setState({loading: false}));

    };

    render() {
        const {loading, message, isMount, isModalVisible} = this.state;
        const formItemStyleName = isMount ? 'form-item active' : 'form-item';

        return (
            <div styleName="root" className="login-bg">
                <Helmet title="注册新用户"/>
                <div styleName="left">
                    <Banner/>
                </div>
                <div styleName="right">
                    <div styleName="box">
                        <div styleName="error-tip">{message}</div>
                        <Form
                            ref={form => this.form = form}
                            name="login"
                            className='inputLine'
                            onFinish={this.handleSubmit}
                        >
                            <div styleName={formItemStyleName}>
                                <div styleName="header">注册新用户</div>
                            </div>
                            <div styleName={formItemStyleName}>
                                <Form.Item
                                    name="username"
                                    rules={[{required: true, message: '请输入用户名'}]}
                                >
                                    <Input allowClear autoFocus prefix={<UserOutlined className="site-form-item-icon"/>} placeholder="用户名"/>
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
                                <Form.Item
                                    name="email"
                                    rules={[{required: true, message: '请输入邮箱'}, validationRule.email()]}
                                >
                                    <Input prefix={<LockOutlined className="site-form-item-icon"/>} placeholder="邮箱"/>
                                </Form.Item>
                            </div>

                            {this.state.use_reg_code?
                                <div styleName={formItemStyleName}>
                                    <Form.Item
                                        name="reg_code"
                                        rules={[{required: true, message: '请输入注册码'}]}
                                    >
                                        <Input prefix={<LockOutlined className="site-form-item-icon"/>} placeholder="注册码"/>
                                    </Form.Item>
                                </div>
                            :
                            null
                            }


                            <div styleName={formItemStyleName}>
                                <Form.Item shouldUpdate={true} style={{marginBottom: 0}}>
                                    {() => (
                                        <Button
                                            styleName="submit-btn"
                                            loading={loading}
                                            type="primary"
                                            htmlType="submit"
                                            disabled={
                                                !this.form?.isFieldsTouched(true) ||
                                                this.form?.getFieldsError().filter(({errors}) => errors.length).length
                                            }
                                        >
                                            注册
                                        </Button>
                                    )}
                                </Form.Item>
                            </div>

                            <div styleName={formItemStyleName}>
                                <Button type="link" onClick={ () => window.location.href =  `${ROUTE_BASE_NAME}/`}>首 页</Button>
                                <Button type="link" onClick={ () => window.location.href =  `${ROUTE_BASE_NAME}/login`}>返回登录</Button>
                                <Button type="link" onClick={ () => window.location.href =  `${ROUTE_BASE_NAME}/forget_password`}>忘记密码</Button>
                            </div>

                        </Form>

                    </div>
                </div>

                <Modal title="注册用户"
                       visible={isModalVisible}
                       onOk={() => {this.setState({isModalVisible: true});toLogin()}}
                       onCancel={() => {this.setState({isModalVisible: true});toLogin()}}
                >
                    <p>{this.state.message}</p>
                </Modal>
            </div>
        );
    }
}

export default Register;

