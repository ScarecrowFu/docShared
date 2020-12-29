import React, {Component} from 'react';
import {Button, Form, notification} from 'antd';
import FormElement from 'src/library/FormElement';
import config from 'src/utils/Hoc/configHoc';
import batchDeleteConfirm from 'src/components/BatchDeleteConfirm';
import { getFileGroupList, deleteFileGroup, bulkDeleteFileGroup } from 'src/apis/file';
import Operator from "src/library/Operator";
import PageContent from "src/layouts/PageContent";
import QueryBar from "src/library/QueryBar";
import FormRow from "src/library/FormRow";
import Table from "src/library/Table";
import Pagination from "src/library/Pagination";
import GroupEditModal from "./GroupEditModal"
import {messageDuration} from "src/config/settings"
import {getUserList} from "src/apis/user"


@config({
    modal: {
        title: '分组管理',
        maskClosable: true
    },
})
class GroupIndexModal extends Component {
    state = {
        loading: false,     // 表格加载数据loading
        dataSource: [],     // 表格数据
        selectedRowKeys: [],// 表格中选中行keys
        total: 0,           // 分页中条数
        pageNum: 1,         // 分页当前页
        pageSize: 10,       // 分页每页显示条数
        deleting: false,    // 批量删除中loading
        ordering: null,           // 排序
        id: null,
        visible: null,
        group_type: 10,       // 分组类型
        user_options: [],
    };

    columns = [
        { title: '分组名称', dataIndex: 'name', sorter: true, width: 100},
        {
            title: '用户', dataIndex: 'creator', sorter: true, width: 100,
            render: (value, record) => {
                return value.nickname;
            }
        },
        { title: '文件数量', dataIndex: 'name', sorter: true, width: 100 },
        { title: '创建时间', dataIndex: 'created_time', sorter: true, width: 100 },
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
                ];
                return <Operator items={items}/>;
            },
        },
    ];

    handleUserOptions = () => {
        getUserList({'not_page': true})
            .then(res => {
                const data = res.data;
                const user_options = [];
                data.results.forEach(function (item) {
                    user_options.push({'value': item.id, 'label': item.nickname})
                });
                this.setState({ user_options: user_options });
            }, error => {
                console.log(error.response);
            })
    };

    componentDidMount() {
        const {group_type} = this.props;
        this.setState({group_type: group_type});
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
            group_type: this.state.group_type,
            page: this.state.pageNum,
            page_size: this.state.pageSize,
        };
        if (this.state.ordering) {
            params['ordering'] = this.state.ordering;
        }
        this.setState({ loading: true });
        getFileGroupList(params)
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

    handleDelete = (id) => {
        if (this.state.deleting) return;
        this.setState({ deleting: true });
        deleteFileGroup(id)
            .then(res => {
                const data = res.data;
                notification.success({
                    message: '删除分组',
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
                bulkDeleteFileGroup({'deleted_objects': selectedRowKeys})
                    .then(res => {
                        const data = res.data;
                        notification.success({
                            message: '批量删除分组',
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
            group_type,
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
                                placeholder="名称"
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

                <GroupEditModal
                    visible={visible}
                    group_type={group_type}
                    id={id}
                    isEdit={id !== null}
                    onOk={() => this.setState({ visible: false }, () => this.handleSubmit())}
                    onCancel={() => this.setState({ visible: false })}
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

export default GroupIndexModal;