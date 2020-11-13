import React, {Component} from 'react';
import config from 'src/utils/Hoc/configHoc';
import PageContent from 'src/layouts/PageContent';
import './style.less';

@config({
    path: '/admin',
    title: {text: '后台管理', icon: 'home'},
    breadcrumbs: [{key: 'admin', text: '后台管理', icon: 'home'}],
})
class Home extends Component {

    render() {
        return (
            <PageContent styleName="root">
                <h1>后台首页</h1>
                <p>减少项目初始化时，携带不必要的依赖，首页不再提供图表示例！</p>
                <p>如果需要更改首页地址，去掉此页面的path配置，将其他页面的path改为/即可，</p>
            </PageContent>
        );
    }
}

export default Home;