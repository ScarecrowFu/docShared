import React, {Component} from 'react';
import config from 'src/utils/Hoc/configHoc';
import {Button, Form, Divider, Tabs, Tree, Space, Timeline, Anchor, Descriptions, Typography, Tooltip} from "antd";
import FormRow from "src/library/FormRow";
import FormElement from "src/library/FormElement";
import {retrieveCDoc} from "src/apis/c_doc";
import {getDocList, retrieveDoc, getDocToc} from "src/apis/doc";
import {
    FieldTimeOutlined, RollbackOutlined, ShareAltOutlined, FileAddOutlined,
    EditOutlined, CopyOutlined, HistoryOutlined, ExportOutlined,
    DeleteOutlined, RadiusSettingOutlined, SearchOutlined} from '@ant-design/icons';
import Footer from "src/layouts/Footer";
import ReactMarkdown from 'react-markdown';
import {Prism as SyntaxHighlighter} from 'react-syntax-highlighter';
import {dark} from 'react-syntax-highlighter/dist/esm/styles/prism';
import gfm from 'remark-gfm';
import math from 'remark-math';
import './style.less';
import {getLoginUser} from "../../../utils/userAuth"


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
        current_doc_toc: [],  //当前展示的文档目录
        latest_docs: [], // 最新文档
        doc_toc: null, // 文档目录
        user_id: null // 当前是否已存在认证用户
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
        let params = {'not_page': true, 'c_doc': c_id, 'page_size': 5, 'ordering': '-created_time'};
        getDocList(params)
            .then(res => {
                const data = res.data;
                this.setState({ latest_docs: data.results });

            }, error => {
                console.log(error.response);
            })
    };

    // 获取最新文档
    handleGetDocToc = () => {
        getDocToc(this.state.current_doc.id)
            .then(res => {
                const data = res.data;
                this.setState({ doc_toc: data.results });
            }, error => {
                console.log(error.response);
            })
    };

    componentDidMount() {
        const params = this.props.match.params;
        const loginUser = getLoginUser();
        const user_id = loginUser?.id;
        this.setState({ user_id: user_id });
        this.setState({ c_id: params.c_id });
        this.fetchCDocData(params.c_id);
        this.handleGetCDocOptions(params.c_id);
        this.handleGetLatestDoc(params.c_id);
        if (this.state.current_doc) {
            this.handleGetDocToc();
        }
    }

    // 获取详细文档
    handleGetCurrentDoc = (doc_id) => {
        retrieveDoc(doc_id)
            .then(res => {
                const data = res.data;
                this.setState({ current_doc: data.results });
                this.handleGetDocToc();
            }, error => {
                console.log(error.response);
            })
    };

    // 选择文档
    onSelectDocTree = (selectedKeys, info) => {
        this.setState({ current_doc_toc: [] });
        this.handleGetCurrentDoc(selectedKeys[0]);
    }

    // 选择文档
    onSelectDoc(value) {
        this.setState({ current_doc_toc: [] });
        this.handleGetCurrentDoc(value);
    }

    // 回到文集信息， 重置当前文档
    onReSetDoc() {
        this.setState({ current_doc: null });
        this.setState({ current_doc_toc: [] });
        this.setState({ doc_toc: null });
    }

    render() {

        const { TabPane } = Tabs;
        const { Title, Paragraph, Text } = Typography;
        const { Link } = Anchor;
        const { c_doc } = this.state;

        // 渲染文档列表
        const renderDocCategory = (doc_options) =>{
            return (
                <Timeline>
                    {
                        doc_options.map(item =>
                            (
                                <Timeline.Item key={item.key}>
                                    <Button type="link" onClick={ () => this.onSelectDoc(item.key)}>{item.title}</Button> <FieldTimeOutlined /> {item.created_time}
                                    {item.children.length>0? <Divider />: null}
                                    {item.children.length>0? renderDocCategory(item.children): null}
                                </Timeline.Item>
                            )
                        )
                    }
                </Timeline>
            );
        }

        // 渲染文档目录
        const renderDocToc = (doc_toc) =>{
            console.log('doc_toc', doc_toc);
            return (
                doc_toc.map(item =>
                    (
                        <Link href={'#' + item.name.toLowerCase().replace(/\W/g, '-')} title={item.name}>
                            {item.children.length > 0? renderDocToc(item.children): null}
                        </Link>
                    )
                )
            );
        }

        // markdown 渲染标题信息
        const flatten = (text, child) => {
            return typeof child === 'string'
                ? text + child
                : React.Children.toArray(child.props.children).reduce(flatten, text)
        }

        // markdown 渲染标题信息
        const HeadingRenderer = (props) => {
            let children = React.Children.toArray(props.children)
            let text = children.reduce(flatten, '')
            let slug = text.toLowerCase().replace(/\W/g, '-');
            return React.createElement('h' + props.level, {id: slug}, props.children)
        }

        // markdown 渲染标题信息
        const renderers = {
            code: ({language, value}) => {
                return <SyntaxHighlighter style={dark} language={language} children={value} />
            },
            heading: HeadingRenderer,
        }

        return (
            <div>
                <div styleName="page-tool">
                    <Form ref={form => this.form = form}>
                        <FormRow styleName="form-row">
                            <FormElement
                                styleName="form-element"
                                name="search"
                                placeholder="搜索当前文集内的文档"
                            />
                            <Tooltip title="搜索" styleName="form-element">
                                <Button  htmlType="submit" shape="circle" icon={<SearchOutlined />} />
                            </Tooltip>
                            <Tooltip title="返回" styleName="form-element">
                                <Button  shape="circle" icon={<RollbackOutlined />} />
                            </Tooltip>
                            <Tooltip title="分享" styleName="form-element">
                                <Button shape="circle" icon={<ShareAltOutlined />} />
                            </Tooltip>
                            <Tooltip title="新增" styleName="form-element">
                                <Button shape="circle" icon={<FileAddOutlined />} />
                            </Tooltip>
                            <Tooltip title="编辑" styleName="form-element">
                                <Button  shape="circle" icon={<EditOutlined />} />
                            </Tooltip>
                            <Tooltip title="克隆" styleName="form-element">
                                <Button shape="circle" icon={<CopyOutlined />} />
                            </Tooltip>
                            <Tooltip title="历史版本" styleName="form-element">
                                <Button type="dashed" shape="circle" icon={<HistoryOutlined />} />
                            </Tooltip>
                            <Tooltip title="导出" styleName="form-element">
                                <Button type="dashed" shape="circle" icon={<ExportOutlined />} />
                            </Tooltip>
                            <Tooltip title="删除" styleName="form-element">
                                <Button type="dashed" shape="circle" icon={<DeleteOutlined />} />
                            </Tooltip>
                            <Tooltip title="文集设置" styleName="form-element">
                                <Button type="dashed" shape="circle" icon={<RadiusSettingOutlined />} />
                            </Tooltip>
                        </FormRow>
                    </Form>
                </div>
                <Divider />

                <div styleName="page-detail">
                    <div styleName="page-docs">
                        <Anchor offsetTop={50}>
                            <Button type="link" onClick={ () => this.onReSetDoc()}> <Title>{c_doc.name}</Title></Button>
                            <Divider />
                            {
                                this.state.doc_options.length
                                    ?
                                    <Tree
                                        defaultExpandAll={true}
                                        treeData={this.state.doc_options}
                                        onSelect={this.onSelectDocTree}
                                        selectedKeys={this.state.current_doc? [this.state.current_doc.id]: null}
                                    />
                                    :
                                    <Paragraph>该文集尚未有文档</Paragraph>
                            }
                        </Anchor>
                    </div>
                    {
                        this.state.current_doc?
                            <div styleName="page-doc-content">
                                <div styleName="page-doc-title"><Title>{this.state.current_doc.title}</Title></div>
                                <Divider />
                                <div styleName="page-doc-author">
                                    <Text type="secondary">
                                        <Space>
                                            {this.state.current_doc.creator? this.state.current_doc.creator.nickname: ''}
                                            <FieldTimeOutlined /> {this.state.current_doc.created_time}
                                        </Space>
                                    </Text>
                                </div>
                                <Divider />
                                <ReactMarkdown
                                    renderers={renderers}
                                    plugins={[gfm, math]}
                                >
                                    {this.state.current_doc.content}
                                </ReactMarkdown>
                            </div>
                            :
                            <div styleName="page-content">
                                <Tabs defaultActiveKey="desc">
                                    <TabPane tab="描述" key="desc">
                                        <Paragraph style={{'width': '90%', 'padding-left': '10%'}}><Text strong>{c_doc.intro} </Text></Paragraph>
                                    </TabPane>
                                    <TabPane tab="目录" key="category">
                                        {renderDocCategory(this.state.doc_options)}
                                    </TabPane>
                                    <TabPane tab="最新文档" key="last_docs">
                                        {
                                            this.state.latest_docs.map(item =>
                                                (
                                                    <div key={item.id}>
                                                        <Descriptions title={<Button type="link" onClick={ () => this.onSelectDoc(item.id)}><Title>{item.title}</Title></Button>} bordered={true} column={2}>
                                                            <Descriptions.Item label="作者">{item.creator? item.creator.nickname: ''}</Descriptions.Item>
                                                            <Descriptions.Item label="时间">{item.created_time}</Descriptions.Item>
                                                            <Descriptions.Item label="内容">{item.content_text.slice(0, 500)}......</Descriptions.Item>
                                                        </Descriptions>
                                                        <Divider/>
                                                    </div>
                                                )
                                            )
                                        }

                                    </TabPane>
                                </Tabs>
                            </div>
                    }
                    <div styleName="page-toc">
                        {this.state.doc_toc?
                            (
                                <Anchor offsetTop={60}>
                                    {renderDocToc(this.state.doc_toc)}
                                </Anchor>
                            ) : <Anchor offsetTop={60} style={{'text-align': 'center'}}>暂无目录</Anchor>
                        }
                    </div>
                </div>
                <div><Footer/></div>
            </div>
        );
    }
}

export default Home;