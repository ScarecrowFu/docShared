import React, {Component} from 'react';
import {
    CaretDownOutlined,
    EditOutlined,
    LogoutOutlined,
    // SettingOutlined,
    SmileOutlined,
    SolutionOutlined,
    SwitcherOutlined,
    LoginOutlined,
} from '@ant-design/icons';
import {Menu, Dropdown} from 'antd';
// import {Link} from 'react-router-dom';
import {toLogin, getLoginUser, removeLoginUser, toHome} from 'src/utils/userAuth';
import ModifyPassword from './ModifyPassword';
import config from 'src/utils/Hoc/configHoc';
import {isObjEmpty} from 'src/utils'
import './style.less';
import {ROUTE_BASE_NAME} from "src/routers/AppRouter";

const Item = Menu.Item;

@config({ajax: true})
class HeaderUser extends Component {
    static defaultProps = {
        theme: 'default',
    };

    state = {
        passwordVisible: false,
    };

    handleMenuClick = ({key}) => {
        if (key === 'logout') {
            removeLoginUser();
            toLogin();
        }

        if (key === 'modifyPassword') {
            this.setState({passwordVisible: true});
        }

        if (key === 'login') {
            window.location.href = `${ROUTE_BASE_NAME}/login`;
        }

        if (key === 'register') {
            window.location.href = `${ROUTE_BASE_NAME}/register`;
        }

        if (key === 'front') {
            // window.location.href = `${ROUTE_BASE_NAME}/`;
            toHome();
        }

        if (key === 'personal') {
            window.location.href = `${ROUTE_BASE_NAME}/personal`;
        }

        if (key === 'admin') {
            window.location.href = `${ROUTE_BASE_NAME}/admin`;
        }

    };

    render() {
        const user = getLoginUser() || {};
        const name = user?.nickname ? user?.nickname : '游客';
        const is_admin = user?.is_admin ? user.is_admin : false;
        const {className, theme} = this.props;

        const menu = (
            <Menu styleName="menu" theme={theme} selectedKeys={[]} onClick={this.handleMenuClick}>
                <Item key="front"><SmileOutlined/>首页</Item>
                {!isObjEmpty(user) ? (<Item key="personal"><SolutionOutlined/>个人中心</Item>) : null}
                {!isObjEmpty(user) && is_admin ? (<Item key="admin"><SwitcherOutlined/>后台管理</Item>) : null}
                <Menu.Divider/>
                {!isObjEmpty(user) ? (<Item key="modifyPassword"><EditOutlined/>修改密码</Item>) : null}
                {/*{!isObjEmpty(user) ? (<Item><Link to="/settings"><SettingOutlined/>设置</Link></Item>) : null}*/}
                {!isObjEmpty(user) ? (<Menu.Divider/>) : null}
                {!isObjEmpty(user) ? (<Item key="logout"><LogoutOutlined/>退出登录</Item>) : <Item key="login"><LoginOutlined/>登录</Item>}
                {/*{!isObjEmpty(user) ? null : <Item key="register"><LoginOutlined/>注册</Item>}*/}

            </Menu>
        );
        return (
            <div styleName="user-menu" ref={node => this.userMenu = node}>
                <Dropdown trigger="click" overlay={menu} getPopupContainer={() => (this.userMenu || document.body)}>
                    <span styleName="account" className={className}>
                        <span styleName="user-name">{name}</span>
                        <CaretDownOutlined/>
                    </span>
                </Dropdown>

                <ModifyPassword
                    visible={this.state.passwordVisible}
                    onOk={() => this.setState({passwordVisible: false})}
                    onCancel={() => this.setState({passwordVisible: false})}
                />
            </div>
        );
    }
}

export default HeaderUser;
