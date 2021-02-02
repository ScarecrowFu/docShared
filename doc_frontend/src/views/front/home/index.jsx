import React, {Component} from 'react';
import config from 'src/utils/Hoc/configHoc';
import './style.less';
import {Button, Form, Divider, Card, Col, Row, Tooltip} from "antd"
import FormRow from "src/library/FormRow";
import FormElement from "src/library/FormElement";
import {getLoginUser} from "src/utils/userAuth";
import Pagination from "src/library/Pagination";
import {
    getCDocList,
    getCDocPermissionTypes, 
    anonymousGetCDocList,
    anonymousGetCDocPermissionTypes,
} from "src/apis/c_doc";
import { SmileTwoTone } from '@ant-design/icons';
import Footer from "src/layouts/Footer";


@config({
    path: '/',
    noAuth: true,
    title: {text: '首页', icon: 'home'},
    breadcrumbs: [{key: 'home', text: '首页', icon: 'home'}],
})
class Home extends Component {
    state = {
        loading: false,     // 加载数据loading
        c_doc_list: [],     // 文集列表
        total: 0,           // 分页中条数
        pageNum: 1,         // 分页当前页
        pageSize: 15,       // 分页每页显示条数
        ordering: null,           // 排序
        perm_confirm_visible: false, // 验证访问码对话框
        click_doc_id: false, // 当前选择的文档
        perm_types: [],           // 权限选项
        perm_options: [],           // 权限选项
        perm_color: {10: '', 20: '#aaeb0e', 30: '#52c41a', 40: '#c45c06'},    // 对应颜色
        login_user: null,
    };

    // 获取文集权限类型
    handlePermissionOptions = () => {
        let CDocPermissionTypesFun = anonymousGetCDocPermissionTypes;
        if (this.state.login_user != null) {
            CDocPermissionTypesFun = getCDocPermissionTypes;
        }
        CDocPermissionTypesFun()
            .then(res => {
                const data = res.data;
                this.setState({ perm_types: data.results });
                const perm_options = [];
                Object.keys(data.results).forEach(function(key) {
                    perm_options.push({'value': key, 'label': data.results[key]});
                });
                this.setState({ perm_options: perm_options });
            }, error => {
                console.log(error.response);
            })
    }

    // 获取数据
    handleSubmit = async () => {
        if (this.state.loading) return;
        let getCDocListFun = anonymousGetCDocList;
        if (this.state.login_user != null) {
            getCDocListFun = getCDocList;
        }
        const values = await this.form.validateFields();
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
        getCDocListFun(params)
            .then(res => {
                const data = res.data;
                const c_doc_list = data?.results || [];
                const total = data?.all_count || 0;
                this.setState({ c_doc_list, total });
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
        const login_user = getLoginUser();
        const that_ = this;
        this.setState({login_user:login_user},function () {
            that_.handlePermissionOptions();
            that_.handleSubmit();
        });
        setTimeout(function(){window.scrollTo(0,0);}, 50);
    }

    // 重置
    handleResetSubmit = () => {
        this.form.resetFields();
        this.handleSubmit();
    }

    clickDoc = (doc_id) => {
        const url = `/detail/${doc_id}/`;
        let link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("target", '_blank');
        link.style.display = "none";
        document.body.appendChild(link);
        link.click();
        URL.revokeObjectURL(url); // 释放URL 对象
        document.body.removeChild(link);
    }

    // 点击具体文档触发
    handleDocClick = (e, doc_id, doc_perm) => {
        e.preventDefault();
        if (doc_perm === 20) {
            this.setState({ perm_confirm_visible: true, click_doc_id: doc_id});
        } else {
            this.clickDoc(doc_id);
        }
    }

    render() {
        const {
            total,
            pageNum,
            pageSize,
            perm_options,
            perm_types,
            perm_color,
            c_doc_list,
        } = this.state;

        const formProps = {
            width: 200,
        };

        // 渲染列表行
        const renderCDocCol= (item) => {
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
            const link = `/detail/${item.id}/`;
            return (
                <Col span={8} key={item.id}>
                    {/*<a href={link} target="_blank" rel="noreferrer" onClick={(e) => this.handleDocClick(e, item.id, item.perm) }>*/}
                    <a href={link} target="_blank" rel="noreferrer">
                        <Card title={
                            <span>
                                <Tooltip title={perm_types[item.perm]}>
                                    <SmileTwoTone twoToneColor={perm_color[item.perm]} />
                                </Tooltip>
                                {item.name}
                            </span>
                        }
                              bordered={true}
                        >
                            <p>作者: {item?.creator?.nickname}</p>
                            <p>最新文档: {item?.latest_doc?.title } </p>
                            {intro}
                        </Card>
                    </a>
                </Col>
            );
        }

        // 渲染列表
        const renderCDoc= () => {
            let renderRows = [], cols = [];
            c_doc_list.forEach(function (item, index) {
                cols.push(renderCDocCol(item));
                if((index+1) % 3 === 0) {
                    renderRows.push(<Row gutter={16} styleName="doc-row" key={index+1}>{cols}</Row>);
                    cols = [];
                }
            })
            if (cols.length > 0) {
                renderRows.push(<Row gutter={16} styleName="doc-row" key={0}>{cols}</Row>);
                cols = [];
            }
            // console.log('renderRows', renderRows);
            return renderRows;
        }

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
                                placeholder="搜索文集"
                            />
                            <FormElement
                                {...formProps}
                                styleName="form-element"
                                showSearch
                                type="select"
                                label="权限"
                                name="perm"
                                options={perm_options}
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

                <div styleName="front-page-content">
                    <div className="site-card-wrapper">
                        {renderCDoc()}
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