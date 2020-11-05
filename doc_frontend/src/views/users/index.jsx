import React, { Component } from 'react';
import { Button, Form } from 'antd';
import PageContent from 'src/layouts/PageContent';
import config from 'src/utils/Hoc/configHoc';
import QueryBar from 'src/library/QueryBar'
import FormRow from 'src/library/FormRow'
import FormElement from 'src/library/FormElement'
import Table from 'src/library/Table'
import Operator from 'src/library/Operator'
import Pagination from 'src/library/Pagination'
import batchDeleteConfirm from 'src/components/BatchDeleteConfirm';
import EditModal from './EditModal';
import { getUserList } from 'src/apis/user'

@config({
    path: '/users',
    ajax: true,
})
class UserCenter extends Component {
    state = {
        loading: false,     // 表格加载数据loading
        dataSource: [],     // 表格数据
        selectedRowKeys: [],// 表格中选中行keys
        total: 0,           // 分页中条数
        pageNum: 1,         // 分页当前页
        pageSize: 20,       // 分页每页显示条数
        deleting: false,    // 批量删除中loading
        visible: false,     // 添加、修改弹框
        id: null,           // 需要修改的数据id
    };

    columns = [
        { title: '账号', dataIndex: 'username', width: 200 },
        { title: '名称', dataIndex: 'nickname', width: 200 },
        { title: '邮箱', dataIndex: 'email', width: 200 },
        { title: '电话', dataIndex: 'phone', width: 200 },
        { title: '性别', dataIndex: 'gender', width: 200 },
        { title: '职称', dataIndex: 'title', width: 200 },
        // { title: '创建时间', dataIndex: 'created_time', width: 200 },
        {
            title: '操作', dataIndex: 'operator', width: 100,
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
                ];
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

        const params = {
            ...values,
            page: this.state.pageNum,
            page_size: this.state.pageSize,
        };

        this.setState({ loading: true });
        getUserList(params)
            .then(res => {
                const data = res.data
                const dataSource = data?.results || [];
                const total = data?.all_count || 0;

                this.setState({ dataSource, total });
            }, error => {
                console.log(error.response)
            })
            .finally(() => this.setState({ loading: false }));
    };

    handleDelete = (id) => {
        if (this.state.deleting) return;

        this.setState({ deleting: true });
        this.props.ajax.del(`/mock/users/${id}`, null, { successTip: '删除成功！', errorTip: '删除失败！' })
            .then(() => this.handleSubmit())
            .finally(() => this.setState({ deleting: false }));
    };

    handleBatchDelete = () => {
        if (this.state.deleting) return;

        const { selectedRowKeys } = this.state;
        batchDeleteConfirm(selectedRowKeys.length)
            .then(() => {
                this.setState({ deleting: true });
                this.props.ajax.del('/mock/users', { ids: selectedRowKeys }, { successTip: '删除成功！', errorTip: '删除失败！' })
                    .then(() => {
                        this.setState({ selectedRowKeys: [] });
                        this.handleSubmit();
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
                                label="名称"
                                name="name"
                            />
                            <FormElement
                                {...formProps}
                                type="select"
                                label="职位"
                                name="job"
                                options={[
                                    { value: 1, label: 1 },
                                    { value: 2, label: 2 },
                                ]}
                            />
                            <FormElement layout>
                                <Button type="primary" htmlType="submit">提交</Button>
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
                    serialNumber
                    pageNum={pageNum}
                    pageSize={pageSize}
                />

                <Pagination
                    total={total}
                    pageNum={pageNum}
                    pageSize={pageSize}
                    onPageNumChange={pageNum => this.setState({ pageNum }, () => this.handleSubmit())}
                    onPageSizeChange={pageSize => this.setState({ pageSize, pageNum: 1 }, () => this.handleSubmit())}
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