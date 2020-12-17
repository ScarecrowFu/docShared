import React, {Component} from 'react';
import config from 'src/utils/Hoc/configHoc';
import './style.less';
import {Button, Form, Divider, Card, Col, Row, Tooltip, Tabs, Tree, Input, Timeline, Select, Descriptions, Badge} from "antd"
import FormRow from "src/library/FormRow"
import FormElement from "src/library/FormElement"
import {getLoginUser} from "src/utils/userAuth"
import Pagination from "src/library/Pagination"
import {getCDocList, retrieveCDoc} from "src/apis/c_doc"
import {getDocList, recoverDoc} from "src/apis/doc"
import { SmileTwoTone, FieldTimeOutlined } from '@ant-design/icons';
import Footer from "src/layouts/Footer"
import { renderToString } from 'react-dom/server'
import ReactMarkdown from 'react-markdown'





@config({
    path: '/detail/:c_id',
    noAuth: true,
    title: {text: '文集详情', icon: 'home'},
    breadcrumbs: [{key: 'home', text: '文集详情', icon: 'home'}],
})
class Home extends Component {
    state = {
        loading: false,     // 加载数据loading
        c_doc: {},     // 文集数据
        c_id: null,           // 当前文集ID
        doc_options: [],  // 文集下的文档选项
        current_doc: null,  //当前展示的文档
        latest_docs: [] // 最新文档
    };

    // 获取文集详情
    fetchCDocData = (c_id) => {
        if (this.state.loading) return;
        this.setState({loading: true});
        retrieveCDoc(c_id)
            .then(res => {
                const data = res.data;
                this.setState({c_doc: data.results});
                document.title = `docShared ${data.results.name}`;
            }, error => {
                console.log(error.response);
            })
            .finally(() => this.setState({loading: false}));
    };

    // 转化文档选项
    getDocOptions = (doc_data) => {
        let doc_options = []
        const _that = this;
        doc_data.forEach(function (item) {
            let doc = {'title': item.title, 'key': item.id, 'children': [], 'created_time': item.created_time};
            const child_docs = item.child_docs;
            if (child_docs.length > 0) {
                doc['children'] = _that.getDocOptions(child_docs);
            }
            doc_options.push(doc)
        })
        return doc_options
    };

    // 获取文档选项
    handleGetCDocOptions = (c_id, search=null) => {
        let params = {'not_page': true, 'c_doc': c_id, 'tree': true};
        if (search) {
            params['search'] = search;
        }
        getDocList(params)
            .then(res => {
                const data = res.data;
                const doc_options = this.getDocOptions(data.results);
                this.setState({ doc_options: doc_options });

            }, error => {
                console.log(error.response);
            })
    };

    // 获取最新文档
    handleGetLatestDoc = (c_id) => {
        let params = {'not_page': true, 'c_doc': c_id, 'page_size': 5, 'ordering': '-created_time', 'show_content': true};
        getDocList(params)
            .then(res => {
                const data = res.data;
                this.setState({ latest_docs: data.results });

            }, error => {
                console.log(error.response);
            })
    };

    componentDidMount() {
        const params = this.props.match.params;
        this.setState({ c_id: params.c_id });
        this.fetchCDocData(params.c_id);
        this.handleGetCDocOptions(params.c_id);
        this.handleGetLatestDoc(params.c_id);
    }

    // 选择文档
    onSelectDocTree = (selectedKeys, info) => {
        console.log('selected', selectedKeys, info);
        this.setState({ current_doc: selectedKeys });
    }

    renderDocCategory = (doc_options) =>{
        return (
            <Timeline>
                {
                    doc_options.map(item =>
                        (
                            <Timeline.Item>
                                {item.title}  <FieldTimeOutlined /> {item.created_time}
                                {item.children.length>0? <Divider />: null}
                                {item.children.length>0? this.renderDocCategory(item.children): null}
                            </Timeline.Item>
                        )
                    )
                }
            </Timeline>
        );

    }


    render() {

        const { TabPane } = Tabs;
        const { c_doc } = this.state;
        console.log(renderToString(this.renderDocCategory(this.state.doc_options)));
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
                        {
                            this.state.doc_options.length
                                ?
                                <Tree
                                    defaultExpandAll={true}
                                    treeData={this.state.doc_options}
                                    onSelect={this.onSelectDocTree}
                                    selectedKeys={this.state.current_doc}
                                />
                                :
                                null
                        }
                    </div>
                    <div styleName="page-content">
                        <Tabs defaultActiveKey="desc">
                            <TabPane tab="描述" key="desc">
                                {c_doc.intro}
                            </TabPane>
                            <TabPane tab="目录" key="category">
                                {this.renderDocCategory(this.state.doc_options)}
                            </TabPane>
                            <TabPane tab="最新文档" key="last_docs">
                                {
                                    this.state.latest_docs.map(item =>
                                        (
                                            <div>
                                                <Descriptions title={item.title} bordered column={1}>
                                                    <Descriptions.Item label="作者">{item.creator? item.creator.nickname: ''}</Descriptions.Item>
                                                    <Descriptions.Item label="时间">{item.created_time}</Descriptions.Item>
                                                    <Descriptions.Item label="内容"><ReactMarkdown>{item.content}</ReactMarkdown></Descriptions.Item>
                                                </Descriptions>
                                                <Divider/>
                                            </div>

                                        )
                                    )
                                }

                            </TabPane>
                        </Tabs>
                    </div>
                    <div styleName="page-toc">
                        <Card title="Card title">
                            <p>Card content</p>
                            <p>Card content</p>
                            <p>Card content</p>
                        </Card>
                    </div>
                </div>
                <div><Footer/></div>
            </div>
        );
    }
}

export default Home;