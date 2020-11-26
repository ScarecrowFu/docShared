import React, {Component} from 'react';
import config from 'src/utils/Hoc/configHoc';
import PageContent from 'src/layouts/PageContent';
import './style.less';

@config({
    path: '/personal',
    title: {text: '个人中心', icon: 'home'},
    breadcrumbs: [{key: 'personal', text: '个人中心', icon: 'home'}],
})
class Home extends Component {

    render() {
        return (
            <PageContent styleName="root">
                <h1>个人中心首页</h1>
                <p>减少项目初始化时，携带不必要的依赖，首页不再提供图表示例！</p>
                <p>如果需要更改首页地址，去掉此页面的path配置，将其他页面的path改为/即可，</p>
            </PageContent>
        );
    }
}

export default Home;