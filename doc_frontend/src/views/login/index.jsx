import React, {Component} from 'react';
import {Helmet} from 'react-helmet';
import {Input, Button, Form } from 'antd';
import {LockOutlined, UserOutlined} from '@ant-design/icons';
import {setLoginUser, toHome} from 'src/utils/userAuth';
import config from 'src/utils/Hoc/configHoc';
import Banner from './banner/index';
import { login } from 'src/apis/user'
import './style.less';
import {ROUTE_BASE_NAME} from "src/routers/AppRouter"
import {getBaseSetInfo, setBaseSetInfoRequest} from "src/utils/info"

@config({
    path: '/login',
    noFrame: true,
    noAuth: true,
})
class Login extends Component {
    state = {
        loading: false,
        message: '',
        isMount: false,
        can_register: false,
    };

    componentDidMount() {
        // mark : 开发时方便测试，填写表单
        // if (process.env.NODE_ENV === 'development') {
        //     this.form.setFieldsValue({username: 'admin', password: 'admin123456'});
        // }
        this.handleBaseInfo();
        setTimeout(() => this.setState({isMount: true}), 300);
    }

    handleBaseInfo = () => {
        const base_info = getBaseSetInfo();
        if (base_info) {
            const can_register = base_info['can_register'];
            this.setState({can_register: can_register});
        } else {
            setBaseSetInfoRequest().then(res => {
                const base_info = getBaseSetInfo();
                const can_register = base_info['can_register'];
                this.setState({can_register: can_register});
            }, error => {
                console.log(error.response);
            });
        }
    }

    handleSubmit = async () => {
        if (this.state.loading) return;
        const values = await this.form.validateFields();

        this.setState({loading: true, message: ''});

        login(values)
            .then(res => {
                const data = res.data
                setLoginUser(data.user);
                toHome();
            }, error => {
                console.log(error.response)
            })
            .catch(() => this.setState({message: '用户名或密码错误！'}))
            .finally(() => this.setState({loading: false}));

    };

    render() {
        const {loading, message, isMount} = this.state;
        const formItemStyleName = isMount ? 'form-item active' : 'form-item';

        return (
            <div styleName="root" className="login-bg">
                <Helmet title="欢迎登陆"/>
                <div styleName="left">
                    <Banner/>
                </div>
                <div styleName="right">
                    <div styleName="box">
                        <Form
                            ref={form => this.form = form}
                            name="login"
                            className='inputLine'
                            onFinish={this.handleSubmit}
                        >
                            <div styleName={formItemStyleName}>
                                <div styleName="header">欢迎登录</div>
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
                                <Form.Item shouldUpdate={true} style={{marginBottom: 12}}>
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
                                            登录
                                        </Button>
                                    )}
                                </Form.Item>
                            </div>

                            <div styleName={formItemStyleName}>
                                <Button type="link" onClick={ () => window.location.href =  `${ROUTE_BASE_NAME}/`}>首 页</Button>
                                {this.state.can_register? <Button type="link" onClick={ () => window.location.href =  `${ROUTE_BASE_NAME}/register`}>注 册</Button> : null}

                                <Button type="link" onClick={ () => window.location.href =  `${ROUTE_BASE_NAME}/forget_password`}>忘记密码</Button>
                            </div>


                        </Form>
                        <div styleName="error-tip">{message}</div>
                    </div>
                </div>
            </div>
        );
    }
}

export default Login;

