import React, {Component} from 'react';
import {Button, Form} from 'antd';
import PageContent from 'src/layouts/PageContent';
import config from 'src/utils/Hoc/configHoc';
import QueryBar from 'src/library/QueryBar';
import FormRow from 'src/library/FormRow';
import FormElement from 'src/library/FormElement';
import Table from 'src/library/Table';
import Operator from 'src/library/Operator';
import Pagination from 'src/library/Pagination';
import { getActionLogList, getActionTypes } from 'src/apis/action_log';
import {getUserList} from 'src/apis/user';
import EditModal from "./EditModal"



@config({
    path: '/admin/system/action_logs',
    title: {text: '日志管理', icon: 'interaction'},
    breadcrumbs: [{key: 'action_log', text: '日志管理', icon: 'interaction'}],
})
class Announcement extends Component {
    state = {
        loading: false,     // 表格加载数据loading
        dataSource: [],     // 表格数据
        selectedRowKeys: [],// 表格中选中行keys
        total: 0,           // 分页中条数
        pageNum: 1,         // 分页当前页
        pageSize: 10,       // 分页每页显示条数
        deleting: false,    // 批量删除中loading
        visible: false,     // 添加、修改弹框
        id: null,           // 需要修改的数据id
        ordering: null,           // 排序
        user_options: [],           // 用户选项
        action_types: {},           // 操作类型
    };

    columns = [
        {
            title: '用户', dataIndex: 'user', sorter: true, width: 100,
            render: (value, record) => {
                if (value) {
                    return value.nickname;
                }
                return '';

            }
        },
        { title: '操作对象', dataIndex: 'content_object', sorter: true, width: 100,
            render: (value, record)  => {
                if (value) {
                    return value.model + '-' + value.name
                }
                return '-'
            }
        },
        { title: '操作类型', dataIndex: 'action_type', sorter: true, width: 100,
            render: (value, record)  => {
                if (value) {
                    return this.state.action_types[value]
                }
                return '-'
            }
            },
        { title: 'IP地址', dataIndex: 'remote_ip', sorter: true, width: 100 },
        { title: '操作时间', dataIndex: 'created_time', sorter: true, width: 100 },
        {
            title: '操作', dataIndex: 'operator', width: 120,
            render: (value, record) => {
                const { id } = record;
                const items = [
                    {
                        label: '详情',
                        onClick: () => this.setState({ visible: true, id }),
                    },
                ];
                return <Operator items={items}/>;
            },
        },
    ];

    handleActionTypes = () => {
        getActionTypes()
            .then(res => {
                const data = res.data;
                this.setState({ action_types: data.results });
            }, error => {
                console.log(error.response);
            })
    }

    handleUserOptions = () => {
        getUserList({'not_page': true})
            .then(res => {
                const data = res.data;
                const user_options = [];
                data.results.forEach(function (item) {
                    user_options.push({'value': item.id, 'label': item.nickname})
                })
                this.setState({ user_options: user_options });
            }, error => {
                console.log(error.response);
            })
    }

    componentDidMount() {
        this.handleUserOptions();
        this.handleActionTypes();
        this.handleSubmit();
    }


    handleSubmit = async () => {
        if (this.state.loading) return;
        const values = await this.form.validateFields();
        if ('created_time' in values) {
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
        getActionLogList(params)
            .then(res => {
                const data = res.data;
                const dataSource = data?.results || [];
                const total = data?.all_count || 0;
                this.setState({ dataSource, total });
            }, error => {
                console.log(error.response);
            })
            .finally(() => this.setState({ loading: false }));
    };

    handleTableChange = (pagination, filters, sorter) => {
        if (sorter !== {}) {
            let ordering = sorter.field;
            if (sorter.order === 'ascend') {
                this.setState({ ordering: ordering });
            }
            if (sorter.order === 'descend') {
                ordering = `-${ordering}`;
                this.setState({ ordering: ordering });
            }
            if (sorter.order === undefined) {
                ordering = null;
                this.setState({ ordering: ordering });
            }
            this.handleSubmit();
        }
    };


    render() {
        const {
            loading,
            dataSource,
            selectedRowKeys,
            total,
            pageNum,
            pageSize,
            visible,
            action_types,
            id,
        } = this.state;

        const formProps = {
            width: 250,
            labelWidth: 60,
        };

        const types_options = [];
        if (action_types) {
            Object.keys(action_types).forEach(function(key) {
                types_options.push({'value': parseInt(key), 'label': action_types[key]});
            });
        }
        return (
            <PageContent>
                <QueryBar>
                    <Form onFinish={() => this.setState({ pageNum: 1 }, () => this.handleSubmit())} ref={form => this.form = form}>
                        <FormRow>
                            <FormElement
                                {...formProps}
                                label="关键字"
                                name="search"
                                placeholder="操作信息"
                            />
                            <FormElement
                                {...formProps}
                                type="select"
                                label="用户"
                                name="creator"
                                options={this.state.user_options}
                            />
                            <FormElement
                                {...formProps}
                                type="select"
                                label="操作类型"
                                name="action_type"
                                options={types_options}
                            />
                            <FormElement
                                width={300}
                                type="date-range"
                                label="创建时间"
                                name="created_time"
                            />
                            <FormElement layout>
                                <Button type="primary" htmlType="submit">搜索</Button>
                                <Button onClick={() => {this.form.resetFields(); this.handleSubmit();}}>重置</Button>
                            </FormElement>
                        </FormRow>
                    </Form>
                </QueryBar>

                <Table
                    rowSelection={{
                        selectedRowKeys,
                        onChange: selectedRowKeys => this.setState({ selectedRowKeys }),
                    }}
                    loading={loading}
                    columns={this.columns}
                    dataSource={dataSource}
                    rowKey="id"
                    serialNumber={false}
                    pageNum={pageNum}
                    pageSize={pageSize}
                    showSorterTooltip={true}
                    onChange={this.handleTableChange}
                />

                <Pagination
                    total={total}
                    pageNum={pageNum}
                    pageSize={pageSize}
                    onPageNumChange={pageNum => this.setState({ pageNum }, () => this.handleSubmit())}
                    onPageSizeChange={pageSize => this.setState({ pageSize, pageNum: 1 })}
                />

                <EditModal
                    visible={visible}
                    id={id}
                    isEdit={id !== null}
                    onOk={() => this.setState({ visible: false }, () => this.handleSubmit())}
                    onCancel={() => this.setState({ visible: false })}
                    width="60%"
                />
            </PageContent>
        );
    }
}

export default Announcement;