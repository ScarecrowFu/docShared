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
import {bulkDeleteEmailCode, deleteEmailCode, getEmailCodeList, getVerificationTypes, getEmailCodeStatus } from 'src/apis/email_code';
import {messageDuration} from "src/config/settings";
import EditModal from "./EditModal";
import './style.less';



@config({
    path: '/admin/system/email_codes',
    title: {text: '验证码管理', icon: 'mail'},
    breadcrumbs: [{key: 'email_code', text: '验证码管理', icon: 'mail'}],
})
class RegisterCode extends Component {
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
        verification_types: {},           // 验证码类型
        code_status: {},
    };

    columns = [
        { title: '电子邮箱', dataIndex: 'email_name', sorter: true, width: 100 },
        { title: '验证码类型', dataIndex: 'verification_type', sorter: true, width: 100,
            render: (value, record) => {
                return this.state.verification_types[value];

            }},
        { title: '验证码', dataIndex: 'verification_code', sorter: true, width: 100 },
        { title: '过期时间', dataIndex: 'expired_time', sorter: true, width: 100 },
        {
            title: '用户', dataIndex: 'creator', sorter: true, width: 100,
            render: (value, record) => {
                if (value) {
                    return value.nickname;
                }
                return '';

            }
        },
        { title: '创建时间', dataIndex: 'created_time', sorter: true, width: 100 },
        {
            title: '操作', dataIndex: 'operator', width: 120,
            render: (value, record) => {
                const { id, code } = record;
                const items = [
                    {
                        label: '编辑',
                        onClick: () => this.setState({ visible: true, id }),
                    },
                    {
                        label: '删除',
                        color: 'red',
                        confirm: {
                            title: `您确定删除"${code}"?`,
                            onConfirm: () => this.handleDelete(id),
                        },
                    },
                ];
                return <Operator items={items}/>;
            },
        },
    ];

    handleVerificationTypes = () => {
        getVerificationTypes()
            .then(res => {
                const data = res.data;
                this.setState({ verification_types: data.results });
            }, error => {
                console.log(error.response);
            })
    }


    componentDidMount() {
        this.handleVerificationTypes();
        this.handleCodeStatus();
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
        getEmailCodeList(params)
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
        deleteEmailCode(id)
            .then(res => {
                const data = res.data;
                notification.success({
                    message: '删除验证码',
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
                bulkDeleteEmailCode({'deleted_objects': selectedRowKeys})
                    .then(res => {
                        const data = res.data;
                        notification.success({
                            message: '批量删除验证码',
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

    setRowClassName = (record) => {
        const { status } = record;
        console.log('status', record, status === 0);
        return status===0? 'row_style' : ''
    }

    handleCodeStatus = () => {
        getEmailCodeStatus()
            .then(res => {
                const data = res.data;
                this.setState({ code_status: data.results });
            }, error => {
                console.log(error.response);
            })
    }

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
            verification_types,
            code_status,
        } = this.state;

        const formProps = {
            width: 200,
        };
        const disabledDelete = !selectedRowKeys?.length;

        const types_options = [];
        Object.keys(verification_types).forEach(function(key) {
            types_options.push({'value': key, 'label': verification_types[key]});
        });

        const status_options = [];
        Object.keys(code_status).forEach(function(key) {
            status_options.push({'value': key, 'label': code_status[key]});
        });

        return (
            <PageContent>
                <QueryBar>
                    <Form onFinish={() => this.setState({ pageNum: 1 }, () => this.handleSubmit())} ref={form => this.form = form}>
                        <FormRow>
                            <FormElement
                                {...formProps}
                                label="关键字"
                                name="search"
                                placeholder="验证码/邮箱"
                            />
                            <FormElement
                                {...formProps}
                                type="select"
                                label="类型"
                                name="verification_type"
                                options={types_options}
                            />
                            <FormElement
                                {...formProps}
                                type="select"
                                label="状态"
                                name="status"
                                options={status_options}
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
                                {/*<Button type="primary" onClick={() => this.setState({ visible: true, id: null })}>添加</Button>*/}
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
                    rowClassName={this.setRowClassName}
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

export default RegisterCode;