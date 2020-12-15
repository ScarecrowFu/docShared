import React, {Component} from 'react';
import config from 'src/utils/Hoc/configHoc';
import './style.less';
import {Button, Form, Divider, Card, Col, Row, Tooltip} from "antd"
import FormRow from "src/library/FormRow"
import FormElement from "src/library/FormElement"
import {getLoginUser} from "src/utils/userAuth"
import Pagination from "src/library/Pagination"
import {getCDocList} from "src/apis/c_doc"
import { SmileTwoTone } from '@ant-design/icons';
import Footer from "src/layouts/Footer"


@config({
    path: '/',
    noAuth: true,
    title: {text: '首页', icon: 'home'},
    breadcrumbs: [{key: 'home', text: '首页', icon: 'home'}],
})
class Home extends Component {
    state = {
        loading: false,     // 表格加载数据loading
        dataSource: [],     // 表格数据
        selectedRowKeys: [],// 表格中选中行keys
        total: 0,           // 分页中条数
        pageNum: 1,         // 分页当前页
        pageSize: 15,       // 分页每页显示条数
        visible: false,     // 添加、修改弹框
        id: null,           // 需要修改的数据id
        ordering: null,           // 排序
        perm_options: [],           // 权限选项
        twoToneColor: {10: '', 20: '#eb2f96', 30: '#52c41a', 40: '#c4b510'},           // 对应颜色
    };

    handlePermissionOptions = () => {
        let perm_options = [{'value': 10, 'label': '公开'}, {'value': 40, 'label': '访问码可见'}]
        const loginUser = getLoginUser();
        const userId = loginUser?.id;
        if (userId) {
            perm_options.push({'value': 20, 'label': '私密'}, {'value': 30, 'label': '成员可见'}, )
        }
        this.setState({ perm_options: perm_options });
    }

    handleSubmit = async () => {
        if (this.state.loading) return;

        const values = await this.form.validateFields();
        console.log(values);
        if ('created_time' in values && values.created_time !== null && values.created_time !== undefined) {
            const created_time = values.created_time;
            if (created_time !== undefined && created_time.length === 2) {
                let min_created_time = created_time[0];
                let max_created_time = created_time[1];
                min_created_time = min_created_time.format('YYYY-MM-DD');
                max_created_time = max_created_time.format('YYYY-MM-DD');
                delete values.created_time;
                values.min_created_time = min_created_time;
                values.max_created_time = max_created_time;
            }
        }
        let params = {
            ...values,
            page: this.state.pageNum,
            page_size: this.state.pageSize,
        };
        if (this.state.ordering) {
            params['ordering'] = this.state.ordering;
        }
        this.setState({ loading: true });
        getCDocList(params)
            .then(res => {
                const data = res.data;
                const dataSource = data?.results || [];
                const total = data?.all_count || 0;
                this.setState({ dataSource, total });
            }, error => {
                console.log(error.response);
            })
            .catch(err => {
                if (err && err.message) {
                    console.log(err.message);
                }
            })
            .finally(() => this.setState({ loading: false }));
    };

    componentDidMount() {
        this.handlePermissionOptions();
        this.handleSubmit();
    }

    handleResetSubmit = () => {
        this.form.resetFields();
        this.handleSubmit();
    }

    renderCDocCol= (item) => {
        let creator = ''
        if (item.creator) {
            creator = item.creator.nickname;
        }
        let intro = item.intro? item.intro : ''
        if (intro.length === 0) {
            intro = (<p>描述: 该文集尚未填写描述</p>);
        } else if (intro.length >= 25) {
            intro = `${intro.slice(0, 25)}......`;
            intro = (
                <Tooltip title={item.intro}>
                    <p>描述: {intro}</p>
                </Tooltip>
            );
        } else {
            intro = (<p>描述: {intro}</p>);
        }
        const link = `/detail/${item.id}/`
        return (
            <Col span={8} key={item.id}>
                <a href={link} target="_blank" rel="noreferrer" >
                    <Card title={<span><SmileTwoTone twoToneColor={this.state.twoToneColor[item.perm]} />  {item.name}</span>} bordered={true}>
                        <p>作者: {creator}</p>
                        <p>最新文档: </p>
                        {intro}
                    </Card>
                </a>
            </Col>
        );
    }

    renderCDoc= () => {
        let renderRows = [], cols = [], _that = this;
        this.state.dataSource.forEach(function (item, index) {
            cols.push(_that.renderCDocCol(item));
            if((index+1) % 3 === 0) {
                renderRows.push(<Row gutter={16} styleName="doc-row" key={index+1}>{cols}</Row>);
                cols = [];
            }
        })
        if (cols.length > 0) {
            renderRows.push(<Row gutter={16} styleName="doc-row" key={0}>{cols}</Row>);
            cols = [];
        }
        return renderRows;
    }

    render() {
        const {
            total,
            pageNum,
            pageSize,
        } = this.state;

        const formProps = {
            width: 200,
        };
        return (
            <div ref={node => this.root = node}>
                <div styleName="page-tool">
                    <Form onFinish={() => this.setState({ pageNum: 1 }, () => this.handleSubmit())} ref={form => this.form = form}>
                        <FormRow styleName="form-row">
                            <FormElement
                                {...formProps}
                                styleName="form-element"
                                label="关键字"
                                name="search"
                                placeholder="搜索文档"
                            />
                            <FormElement
                                {...formProps}
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
                                {...formProps}
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

                <div styleName="page-content">
                    <div className="site-card-wrapper">
                        {this.renderCDoc()}
                    </div>

                    <Pagination
                        total={total}
                        pageNum={pageNum}
                        pageSize={pageSize}
                        onPageNumChange={pageNum => this.setState({ pageNum }, () => this.handleSubmit())}
                        onPageSizeChange={pageSize => this.setState({ pageSize, pageNum: 1 })}
                    />
                </div>
                <div><Footer/></div>
            </div>
        );
    }
}

export default Home;