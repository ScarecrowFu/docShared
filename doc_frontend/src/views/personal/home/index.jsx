import React, {Component} from 'react';
import config from 'src/utils/Hoc/configHoc';
import './style.less';
import HomeBase from "../../base/home"

@config({
    path: '/personal',
    title: {text: '个人中心', icon: 'home'},
    breadcrumbs: [{key: 'personal', text: '个人中心', icon: 'home'}],
})
class Home extends Component {

    state = {
        personal: true,  // 是否个人中心
    };
    render() {
        const {
            personal,
        } = this.state;

        return (
            <HomeBase personal={personal} />
        );
    }
}

export default Home;