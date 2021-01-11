import React, {Component} from 'react';
import {Button, Form, notification} from 'antd';
import PageContent from 'src/layouts/PageContent';
import QueryBar from 'src/library/QueryBar';
import FormRow from 'src/library/FormRow';
import FormElement from 'src/library/FormElement';
import Table from 'src/library/Table';
import Operator from 'src/library/Operator';
import Pagination from 'src/library/Pagination';
import batchDeleteConfirm from 'src/components/BatchDeleteConfirm';
import {recoverDoc, getDocList, getDocStatus, bulkRecoverDoc, deleteDoc, bulkDeleteDoc} from 'src/apis/doc';
import {getUserList} from 'src/apis/user';
import {messageDuration} from "src/config/settings";
import PropTypes from "prop-types"


export default class DocRecycleBase extends Component {

    static propTypes = {
        personal: PropTypes.bool,
        cooperate: PropTypes.bool,
    };


    static defaultProps = {
        personal: true,
        cooperate: false,
    };


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
        statusTypes: {},
        status_options: [],           // 状态选项
        user_options: [],           // 用户选项
    };

    handleTableColumn = () => {
        let columns = [
            { title: '文档标题', dataIndex: 'title', sorter: true, width: 100 },
            { title: '所属文集', dataIndex: 'c_doc', sorter: true, width: 100,
                render: (value, record) => {
                    if (value) {
                        return value.name;
                    }
                    return '-'
                }
            },
            { title: '上级文档', dataIndex: 'parent_doc', sorter: true, width: 100,
                render: (value, record) => {
                    if (value) {
                        return value.title;
                    }
                    return '无上级文档'

                }
            },
        ];
        if (!this.props.personal) {
            columns = columns.concat([
                {
                    title: '用户', dataIndex: 'creator', sorter: true, width: 100,
                    render: (value, record) => {
                        if (value) {
                            return value.nickname;
                        }
                        return '';
                    }
                },
            ])
        }
        columns = columns.concat([
            { title: '创建时间', dataIndex: 'created_time', sorter: true, width: 100 },
            { title: '文档状态', dataIndex: 'status', sorter: true, width: 100,
                render: (value, record) => {
                    return this.state.statusTypes[value];
                }
            },
            {
                title: '操作', dataIndex: 'operator', width: 120,
                render: (value, record) => {
                    const { id, title } = record;
                    const items = [
                        {
                            label: '还原',
                            confirm: {
                                title: `您确定还原"${title}"?`,
                                onConfirm: () => this.handleRecover(id),
                            },
                        },
                        {
                            label: '清空',
                            color: 'red',
                            confirm: {
                                title: `您确定清空"${title}"?`,
                                onConfirm: () => this.handleDelete(id),
                            },
                        },
                    ];
                    return <Operator items={items}/>;
                },
            },
        ]);
        return columns;
    }

    handleStatusTypes = () => {
        getDocStatus()
            .then(res => {
                const data = res.data;
                this.setState({ statusTypes: data.results });
                const status_options = [];
                Object.keys(data.results).forEach(function(key) {
                    status_options.push({'value': key, 'label': data.results[key]});
                });
                this.setState({ status_options: status_options });
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
        this.handleStatusTypes();
        this.handleUserOptions();
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
            personal: this.props.personal,
            is_deleted: true,
            page: this.state.pageNum,
            page_size: this.state.pageSize,
        };
        if (this.state.ordering) {
            params['ordering'] = this.state.ordering;
        }
        this.setState({ loading: true });
        getDocList(params)
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

    handleRecover = (id) => {
        if (this.state.deleting) return;
        this.setState({ deleting: true });
        recoverDoc(id)
            .then(res => {
                const data = res.data;
                notification.success({
                    message: '还原文档',
                    description: data.messages,
                    duration: messageDuration,
                });
                this.handleSubmit();
            }, error => {
                console.log(error.response);
            })
            .finally(() => this.setState({ deleting: false }));
    };

    handleDelete = (id) => {
        if (this.state.deleting) return;
        this.setState({ deleting: true });
        deleteDoc(id, {'clear': true})
            .then(res => {
                const data = res.data;
                notification.success({
                    message: '清空文档',
                    description: data.messages,
                    duration: messageDuration,
                });
                this.handleSubmit();
            }, error => {
                console.log(error.response);
            })
            .finally(() => this.setState({ deleting: false }));
    };


    handleBatchRecover = () => {
        if (this.state.deleting) return;
        this.setState({ deleting: true });
        const { selectedRowKeys } = this.state;
        batchDeleteConfirm(selectedRowKeys.length)
            .then(() => {
                bulkRecoverDoc({'recover_objects': selectedRowKeys})
                    .then(res => {
                        const data = res.data;
                        notification.success({
                            message: '批量还原文档',
                            description: data.messages,
                            duration: messageDuration,
                        });
                        this.setState({ selectedRowKeys: [] });
                        this.handleSubmit();
                    }, error => {
                        console.log(error.response);
                    })
                    .catch(function (error) {
                        console.log(error);
                    })
                    .finally(() => this.setState({ deleting: false }));
            })
            .catch(function (error) {
                console.log(error);
            })
            .finally(() => this.setState({ deleting: false }));
    };

    handleBatchDelete = () => {
        if (this.state.deleting) return;
        this.setState({ deleting: true });
        const { selectedRowKeys } = this.state;
        batchDeleteConfirm(selectedRowKeys.length)
            .then(() => {
                bulkDeleteDoc({'deleted_objects': selectedRowKeys, 'clear': true})
                    .then(res => {
                        const data = res.data;
                        notification.success({
                            message: '批量清空文档',
                            description: data.messages,
                            duration: messageDuration,
                        });
                        this.setState({ selectedRowKeys: [] });
                        this.handleSubmit();
                    }, error => {
                        console.log(error.response);
                    })
                    .catch(function (error) {
                        console.log(error);
                    })
                    .finally(() => this.setState({ deleting: false }));
            })
            .catch(function (error) {
                console.log(error);
            })
            .finally(() => this.setState({ deleting: false }));
    };

    render() {
        const {
            loading,
            deleting,
            dataSource,
            selectedRowKeys,
            total,
            pageNum,
            pageSize,
        } = this.state;

        const formProps = {
            width: 200,
        };
        const disabledDelete = !selectedRowKeys?.length;

        const {personal} = this.props;

        return (
            <PageContent>
                <QueryBar>
                    <Form onFinish={() => this.setState({ pageNum: 1 }, () => this.handleSubmit())} ref={form => this.form = form}>
                        <FormRow>
                            <FormElement
                                {...formProps}
                                label="关键字"
                                name="search"
                                placeholder="标题"
                            />
                            <FormElement
                                {...formProps}
                                type="select"
                                label="状态"
                                name="status"
                                options={this.state.status_options}
                            />
                            {
                                personal? null : <FormElement
                                    {...formProps}
                                    showSearch
                                    type="select"
                                    label="用户"
                                    name="creator"
                                    options={this.state.user_options}
                                />
                            }
                            <FormElement
                                width={300}
                                type="date-range"
                                label="创建时间"
                                name="created_time"
                            />
                            <FormElement layout>
                                <Button type="primary" htmlType="submit">搜索</Button>
                                <Button onClick={() => {this.form.resetFields(); this.handleSubmit();}}>重置</Button>
                                <Button danger loading={deleting} disabled={disabledDelete} onClick={this.handleBatchRecover}>还原</Button>
                                <Button danger loading={deleting} disabled={disabledDelete} onClick={this.handleBatchDelete}>清空</Button>
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
                    columns={this.handleTableColumn()}
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
            </PageContent>
        );
    }
}