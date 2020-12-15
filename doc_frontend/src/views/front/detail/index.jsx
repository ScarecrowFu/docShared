import React, {Component} from 'react';
import config from 'src/utils/Hoc/configHoc';
import './style.less';
import {Button, Form, Divider, Card, Col, Row, Tooltip, Tabs, Tree, Input} from "antd"
import FormRow from "src/library/FormRow"
import FormElement from "src/library/FormElement"
import {getLoginUser} from "src/utils/userAuth"
import Pagination from "src/library/Pagination"
import {getCDocList, retrieveCDoc} from "src/apis/c_doc"
import { SmileTwoTone } from '@ant-design/icons';
import Footer from "src/layouts/Footer"
import {getDocList} from "src/apis/doc"


@config({
    path: '/detail/:c_id',
    noAuth: true,
    title: {text: '文集详情', icon: 'home'},
    breadcrumbs: [{key: 'home', text: '文集详情', icon: 'home'}],
})
class Home extends Component {
    state = {
        loading: false,     // 表格加载数据loading
        dataSource: [],     // 表格数据
        id: null,           // 需要修改的数据id
        doc_options: []
    };

    fetchData = (id) => {
        if (this.state.loading) return;
        this.setState({loading: true});
        retrieveCDoc(id)
            .then(res => {
                const data = res.data;
                this.setState({dataSource: data.results});
            }, error => {
                console.log(error.response);
            })
            .finally(() => this.setState({loading: false}));
    };

    getDocOptions = (doc_data) => {
        let doc_options = []
        const _that = this;
        doc_data.forEach(function (item) {
            let doc = {'title': item.title, 'key': item.id, 'children': []};
            const child_docs = item.child_docs;
            if (child_docs.length > 0) {
                doc['children'] = _that.getDocOptions(child_docs);
            }
            doc_options.push(doc)
        })
        return doc_options
    };

    handleCDocSelect = (id, search=null) => {
        let params = {'not_page': true, 'c_doc': id, 'tree': true};
        if (search) {
            params['search'] = search;
        }
        getDocList(params)
            .then(res => {
                const data = res.data;
                const doc_options = this.getDocOptions(data.results);
                console.log('doc_options', doc_options);
                this.setState({ doc_options: doc_options });

            }, error => {
                console.log(error.response);
            })
    };

    componentDidMount() {
        const params = this.props.match.params;
        this.setState({ id: params.c_id });
        this.fetchData(this.state.id);
        this.handleCDocSelect(this.state.id);
    }


    onSelectTreeDoc = e => {
        const { value } = e.target;
        this.handleCDocSelect(this.state.id, value);
    };


    render() {

        const { TabPane } = Tabs;

        const { Search } = Input;


        return (
            <div>
                <div styleName="page-tool">
                    <Form ref={form => this.form = form}>
                        <FormRow styleName="form-row">
                            <FormElement
                                styleName="form-element"
                                label="关键字"
                                name="search"
                                placeholder="搜索文档"
                            />
                            <FormElement
                                styleName="form-element"
                                showSearch
                                type="select"
                                label="权限"
                                name="perm"
                                options={this.state.perm_options}
                            />
                            <FormElement
                                width={300}
                                styleName="form-element"
                                type="date-range"
                                label="时间"
                                name="created_time"
                            />
                            <FormElement
                                styleName="form-element"
                                showSearch
                                type="select"
                                label="排序"
                                name="ordering"
                                options={[{'value': 'created_time', 'label': '时间生序'}, {'value': '-created_time', 'label': '时间降序'}]}
                            />
                            <FormElement layout>
                                <Button type="primary" htmlType="submit" styleName="form-btn">搜 索</Button>
                                <Button onClick={this.handleResetSubmit} styleName="form-btn">重 置</Button>
                            </FormElement>
                        </FormRow>
                    </Form>
                </div>
                <Divider />
                <div styleName="page-detail">
                    <div styleName="page-docs">
                        <Search style={{ marginBottom: 18, width: '80%'}} placeholder="Search" onSearch={this.onSelectTreeDoc} />
                        <Tree
                            defaultExpandAll={true}
                            treeData={this.state.doc_options}
                        />
                    </div>
                    <div styleName="page-content">
                        <Tabs defaultActiveKey="1">
                            <TabPane tab="描述" key="1">
                                Content of Tab Pane 1
                            </TabPane>
                            <TabPane tab="目录" key="2">
                                Content of Tab Pane 2
                            </TabPane>
                            <TabPane tab="文档" key="3">
                                Content of Tab Pane 3
                            </TabPane>
                        </Tabs>
                    </div>
                    <div styleName="page-toc">
                        sss
                    </div>
                </div>
                <div><Footer/></div>
            </div>
        );
    }
}

export default Home;