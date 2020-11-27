import React, {Component} from 'react';
import {Button, Form, notification} from 'antd';
import PageContent from 'src/layouts/PageContent';
import config from 'src/utils/Hoc/configHoc';
import QueryBar from 'src/library/QueryBar';
import FormRow from 'src/library/FormRow';
import FormElement from 'src/library/FormElement';
import Table from 'src/library/Table';
import Operator from 'src/library/Operator';
import Pagination from 'src/library/Pagination';
import batchDeleteConfirm from 'src/components/BatchDeleteConfirm';
import {bulkDeleteCDoc, deleteCDoc, getCDocList, getCDocPermissionTypes} from 'src/apis/c_doc';
import {getUserList} from 'src/apis/user';
import {messageDuration} from "src/config/settings";



@config({
    path: '/admin/docs/docs',
    title: {text: '文档管理', icon: 'file'},
    breadcrumbs: [{key: 'doc', text: '文档管理', icon: 'file'}],
})
class CDoc extends Component {
    state = {
        loading: false,     // 表格加载数据loading
        dataSource: [],     // 表格数据
        selectedRowKeys: [],// 表格中选中行keys
        total: 0,           // 分页中条数
        pageNum: 1,         // 分页当前页
        pageSize: 10,       // 分页每页显示条数
        deleting: false,    // 批量删除中loading
        visible: false,     // 添加、修改弹框
        visiblePerm: false,     // 修改文集权限
        visibleMember: false,     // 修改文集成員
        visibleSetting: false,     // 修改文集设置
        visibleTransfer: false,     // 转让
        id: null,           // 需要修改的数据id
        ordering: null,           // 排序
        permissionTypes: {},
        perm_options: [],           // 权限选项
        user_options: [],           // 用户选项
    };

    columns = [
        { title: '名称', dataIndex: 'name', sorter: true, width: 200 },
        { title: '简介', dataIndex: 'intro', sorter: true, width: 200 },
        {title: '文档数量', dataIndex: 'docs_cnt', sorter: true, width: 100},
        {
            title: '权限', dataIndex: 'perm', sorter: true, width: 100,
            render: (value, record) => {
                const { id, perm } = record;
                const items = [
                    {
                        label: '文集权限',
                        icon: 'form',
                        onClick: () => this.setState({ visiblePerm: true, id }),
                    },
                ];
                return <span> {this.state.permissionTypes[perm] } {<Operator items={items}/>}</span>;
            },
        },
        { title: '创建时间', dataIndex: 'created_time', sorter: true, width: 100 },
        {
            title: '用户', dataIndex: 'creator', sorter: true, width: 100,
            render: (value, record) => {
                return value.nickname;
            }
        },
        {
            title: '操作', dataIndex: 'operator', width: 120,
            render: (value, record) => {
                const { id, name } = record;
                const items = [
                    {
                        label: '编辑',
                        onClick: () => this.setState({ visible: true, id }),
                    },
                    {
                        label: '删除',
                        color: 'red',
                        confirm: {
                            title: `您确定删除"${name}"?`,
                            onConfirm: () => this.handleDelete(id),
                        },
                    },
                    {
                        label: '成员',
                        color: 'grey',
                        isMore: true,
                        onClick: () => this.setState({ visibleMember: true, id }),
                    },
                    {
                        label: '设置',
                        color: 'grey',
                        isMore: true,
                        onClick: () => this.setState({ visibleSetting: true, id }),
                    },
                    {
                        label: '导出(todo)',
                        color: 'grey',
                        isMore: true,
                        onClick: () => this.setState({ visibleSetting: true, id }),
                    },
                    {
                        label: '转让',
                        color: 'grey',
                        isMore: true,
                        onClick: () => this.setState({ visibleTransfer: true, id }),
                    },
                ];
                return <Operator items={items}/>;
            },
        },
    ];

    handlePermissionTypes = () => {
        getCDocPermissionTypes()
            .then(res => {
                const data = res.data;
                this.setState({ permissionTypes: data.results });
                const perm_options = [];
                Object.keys(data.results).forEach(function(key) {
                    perm_options.push({'value': key, 'label': data.results[key]});
                });
                this.setState({ perm_options: perm_options });
            }, error => {
                console.log(error.response);
            })
    }
    // todo 整理为分页获取选项
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
        this.handlePermissionTypes();
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

    handleDelete = (id) => {
        if (this.state.deleting) return;
        this.setState({ deleting: true });
        deleteCDoc(id)
            .then(res => {
                const data = res.data;
                notification.success({
                    message: '删除用户',
                    description: data.messages,
                    duration: messageDuration,
                });
                this.handleSubmit();
            }, error => {
                console.log(error.response);
            })
            .finally(() => this.setState({ deleting: false }));
    };


    handleBatchDelete = () => {
        if (this.state.deleting) return;
        this.setState({ deleting: true });
        const { selectedRowKeys } = this.state;
        batchDeleteConfirm(selectedRowKeys.length)
            .then(() => {
                bulkDeleteCDoc({'deleted_objects': selectedRowKeys})
                    .then(res => {
                        const data = res.data;
                        notification.success({
                            message: '批量删除用户',
                            description: data.messages,
                            duration: messageDuration,
                        });
                        this.setState({ selectedRowKeys: [] });
                        this.handleSubmit();
                    }, error => {
                        console.log(error.response);
                    })
                    .finally(() => this.setState({ deleting: false }));
            });
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
        return (
            <PageContent>
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
                                type="select"
                                label="权限"
                                name="perm"
                                options={this.state.perm_options}
                            />
                            <FormElement
                                {...formProps}
                                type="select"
                                label="用户"
                                name="creator"
                                options={this.state.user_options}
                            />
                            <FormElement
                                width={300}
                                type="date-range"
                                label="创建时间"
                                name="created_time"
                            />
                            <FormElement layout>
                                <Button type="primary" htmlType="submit">搜索</Button>
                                <Button onClick={() => this.form.resetFields()}>重置</Button>
                                <Button type="primary" onClick={() => this.setState({ visible: true, id: null })}>添加</Button>
                                <Button danger loading={deleting} disabled={disabledDelete} onClick={this.handleBatchDelete}>删除</Button>
                                <Button danger loading={deleting} disabled={disabledDelete} onClick={this.handleBatchDelete}>导入文集(todo)</Button>
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
            </PageContent>
        );
    }
}

export default CDoc;