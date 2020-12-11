import React, {Component} from 'react';
import config from 'src/utils/Hoc/configHoc';
import PageContent from 'src/layouts/PageContent';
import './style.less';
import {Button, Form, Spin} from "antd"
import FormRow from "src/library/FormRow"
import FormElement from "src/library/FormElement"
import QueryBar from "src/library/QueryBar"
import Footer from "../../../layouts/Footer"


@config({
    path: '/',
    noAuth: true,
    title: {text: '首页', icon: 'home'},
    breadcrumbs: [{key: 'home', text: '首页', icon: 'home'}],
})
class Home extends Component {

    render() {
        const formProps = {
            width: 200,
        };

        const tip = 'test';

        return (
            <div ref={node => this.root = node} stylename="page-content-root">
                <div styleName="page-loading">
                    <Spin spinning tip={tip}/>
                </div>
                <div styleName="page-content">
                    <QueryBar>
                        <Form onFinish={() => this.setState({ pageNum: 1 }, () => this.handleSubmit())} ref={form => this.form = form}>
                            <FormRow>
                                <FormElement
                                    {...formProps}
                                    label="关键字"
                                    name="search"
                                    placeholder="名称"
                                />
                                <FormElement
                                    {...formProps}
                                    showSearch
                                    type="select"
                                    label="权限"
                                    name="perm"
                                    // options={this.state.perm_options}
                                />
                                <FormElement
                                    {...formProps}
                                    showSearch
                                    type="select"
                                    label="用户"
                                    name="creator"
                                    // options={this.state.user_options}
                                />
                                <FormElement
                                    width={300}
                                    type="date-range"
                                    label="创建时间"
                                    name="created_time"
                                />
                                <FormElement layout>
                                    <Button type="primary" htmlType="submit">搜 索</Button>
                                    <Button onClick={() => this.form.resetFields()}>重 置</Button>
                                </FormElement>
                            </FormRow>
                        </Form>
                    </QueryBar>

                    <h1>前台首页</h1>
                    <p>减少项目初始化时，携带不必要的依赖，首页不再提供图表示例！减少项目初始化时，携带不必要的依赖，首页不再提供图表示例！减少项目初始化时，携带不必要的依赖，首页不再提供图表示例！减少项目初始化时，携带不必要的依赖，首页不再提供图表示例！减少项目初始化时，携带不必要的依赖，首页不再提供图表示例！减少项目初始化时，携带不必要的依赖，首页不再提供图表示例！减少项目初始化时，携带不必要的依赖，首页不再提供图表示例！减少项目初始化时，携带不必要的依赖，首页不再提供图表示例！减少项目初始化时，携带不必要的依赖，首页不再提供图表示例！减少项目初始化时，携带不必要的依赖，首页不再提供图表示例！减少项目初始化时，携带不必要的依赖，首页不再提供图表示例！减少项目初始化时，携带不必要的依赖，首页不再提供图表示例！减少项目初始化时，携带不必要的依赖，首页不再提供图表示例！减少项目初始化时，携带不必要的依赖，首页不再提供图表示例！减少项目初始化时，携带不必要的依赖，首页不再提供图表示例！减少项目初始化时，携带不必要的依赖，首页不再提供图表示例！减少项目初始化时，携带不必要的依赖，首页不再提供图表示例！减少项目初始化时，携带不必要的依赖，首页不再提供图表示例！减少项目初始化时，携带不必要的依赖，首页不再提供图表示例！减少项目初始化时，携带不必要的依赖，首页不再提供图表示例！减少项目初始化时，携带不必要的依赖，首页不再提供图表示例！减少项目初始化时，携带不必要的依赖，首页不再提供图表示例！减少项目初始化时，携带不必要的依赖，首页不再提供图表示例！减少项目初始化时，携带不必要的依赖，首页不再提供图表示例！减少项目初始化时，携带不必要的依赖，首页不再提供图表示例！减少项目初始化时，携带不必要的依赖，首页不再提供图表示例！减少项目初始化时，携带不必要的依赖，首页不再提供图表示例！减少项目初始化时，携带不必要的依赖，首页不再提供图表示例！减少项目初始化时，携带不必要的依赖，首页不再提供图表示例！减少项目初始化时，携带不必要的依赖，首页不再提供图表示例！减少项目初始化时，携带不必要的依赖，首页不再提供图表示例！减少项目初始化时，携带不必要的依赖，首页不再提供图表示例！减少项目初始化时，携带不必要的依赖，首页不再提供图表示例！减少项目初始化时，携带不必要的依赖，首页不再提供图表示例！减少项目初始化时，携带不必要的依赖，首页不再提供图表示例！减少项目初始化时，携带不必要的依赖，首页不再提供图表示例！减少项目初始化时，携带不必要的依赖，首页不再提供图表示例！减少项目初始化时，携带不必要的依赖，首页不再提供图表示例！减少项目初始化时，携带不必要的依赖，首页不再提供图表示例！减少项目初始化时，携带不必要的依赖，首页不再提供图表示例！减少项目初始化时，携带不必要的依赖，首页不再提供图表示例！减少项目初始化时，携带不必要的依赖，首页不再提供图表示例！减少项目初始化时，携带不必要的依赖，首页不再提供图表示例！</p>
                    <p>如果需要更改首页地址，去掉此页面的path配置，将其他页面的path改为/即可，</p>
                </div>
                {/*{footer ? <div styleName="footer"><Footer/></div> : null}*/}
            </div>
            // <PageContent style={{
            //     display: 'none',
            //     left: 0,
            //     top: '85px',
            // }}>

            // </PageContent>
        );
    }
}

export default Home;