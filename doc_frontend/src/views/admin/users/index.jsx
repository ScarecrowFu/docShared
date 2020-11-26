import React, { Component } from 'react';
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
import EditModal from './EditModal';
import { getUserList, deleteUser, bulkDeleteUser, activationUser } from 'src/apis/user';
import { yesOrNoTag } from 'src/utils/tagRender';
import {getLoginUser} from 'src/utils/userAuth';
import {messageDuration} from "src/config/settings"

@config({
    path: '/admin/users',
    title: {text: '用户管理', icon: 'user'},
    breadcrumbs: [{key: 'user', text: '用户管理', icon: 'user'}],
})
class UserCenter extends Component {
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
    };

    columns = [
        { title: '账号', dataIndex: 'username', sorter: true, width: 200 },
        { title: '名称', dataIndex: 'nickname', sorter: true, width: 200 },
        { title: '邮箱', dataIndex: 'email', sorter: true, width: 200 },
        { title: '电话', dataIndex: 'phone', sorter: true, width: 100 },
        { title: '性别', dataIndex: 'gender', sorter: true, width: 100 },
        { title: '职称', dataIndex: 'title', sorter: true, width: 100 },
        {
            title: '管理员', dataIndex: 'is_admin', sorter: true, width: 100,
            render: (value, record)  => {
                return yesOrNoTag(value)
            },
        },
        {
            title: '操作', dataIndex: 'operator', width: 120,
            render: (value, record) => {
                const { id, nickname, is_active } = record;
                const authInfo = getLoginUser()
                const authUserID = authInfo.id;
                const items = [
                    {
                        label: '编辑',
                        onClick: () => this.setState({ visible: true, id }),
                    },
                ];
                if (authUserID !== id) {
                    items.push(
                        {
                            label: '删除',
                            color: 'red',
                            confirm: {
                                title: `您确定删除"${nickname}"?`,
                                onConfirm: () => this.handleDelete(id),
                            },
                        },
                    )
                    if (is_active) {
                        items.push(
                            {
                                label: '禁用',
                                color: 'gray',
                                confirm: {
                                    title: `您确定禁用"${nickname}"?`,
                                    onConfirm: () => this.handleActivation(id, false),
                                },
                            },
                        )
                    }
                    else {
                        items.push(
                            {
                                label: '启用',
                                color: 'blue',
                                confirm: {
                                    title: `您确定启用"${nickname}"?`,
                                    onConfirm: () => this.handleActivation(id, true),
                                },
                            },
                        )
                    }
                }
                return <Operator items={items}/>;
            },
        },
    ];

    componentDidMount() {
        this.handleSubmit();
    }

    handleSubmit = async () => {
        if (this.state.loading) return;

        const values = await this.form.validateFields();

        let params = {
            ...values,
            page: this.state.pageNum,
            page_size: this.state.pageSize,
        };
        if (this.state.ordering) {
            params['ordering'] = this.state.ordering;
        }

        this.setState({ loading: true });
        getUserList(params)
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
        deleteUser(id)
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

    handleActivation = (id, active=true) => {
        const activeText = active ? '启用！' : '禁用';
        activationUser(id, {'active': active})
            .then(res => {
                const data = res.data;
                notification.success({
                    message: `${activeText}用户`,
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
                bulkDeleteUser({'deleted_objects': selectedRowKeys})
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
            visible,
            id,
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
                                placeholder="账号/昵称/邮箱"
                            />
                            <FormElement
                                {...formProps}
                                type="select"
                                label="性别"
                                name="gender"
                                options={[
                                    { value: '男', label: '男' },
                                    { value: '女', label: '女' },
                                ]}
                            />
                            <FormElement
                                {...formProps}
                                type="select"
                                label="管理员"
                                placeholder="是否管理员"
                                name="is_admin"
                                options={[
                                    { value: true, label: '是' },
                                    { value: false, label: '否' },
                                ]}
                            />
                            <FormElement
                                {...formProps}
                                type="select"
                                label="可用"
                                name="is_active"
                                placeholder="是否可用"
                                options={[
                                    { value: true, label: '是' },
                                    { value: false, label: '否' },
                                ]}
                            />
                            <FormElement layout>
                                <Button type="primary" htmlType="submit">搜索</Button>
                                <Button onClick={() => this.form.resetFields()}>重置</Button>
                                <Button type="primary" onClick={() => this.setState({ visible: true, id: null })}>添加</Button>
                                <Button danger loading={deleting} disabled={disabledDelete} onClick={this.handleBatchDelete}>删除</Button>
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
                />
            </PageContent>
        );
    }
}

export default UserCenter;