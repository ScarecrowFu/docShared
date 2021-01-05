import React, {Component} from 'react';
import config from 'src/utils/Hoc/configHoc';
import HomeBase from 'src/views/base/home'


@config({
        path: '/admin',
        title: {text: '后台管理', icon: 'home'},
        breadcrumbs: [{key: 'admin', text: '后台管理', icon: 'home'}],
})
class Home extends Component {

        state = {
                personal: false,  // 是否个人中心
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