import React, {Component} from 'react';
import {Button, Form, notification, Tag, Image} from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import PageContent from 'src/layouts/PageContent';
import QueryBar from 'src/library/QueryBar';
import FormRow from 'src/library/FormRow';
import FormElement from 'src/library/FormElement';
import Pagination from 'src/library/Pagination';
import {
    getFileGroupList,
    getFileAttachmentList,
    deleteFileAttachment,
    bulkDeleteFileAttachment
} from 'src/apis/file';
import {getUserList} from 'src/apis/user';
import {messageDuration, baseURL} from "src/config/settings";
import './style.less'
import Table from "src/library/Table"
import Operator from "src/library/Operator"
import UploadModal from './UploadModal'
import {handleFileTypeIcon} from './images'
import GroupEditModal from 'src/views/base/file_images/GroupEditModal';
import GroupIndexModal from 'src/views/base/file_images/GroupIndexModal';
import batchDeleteConfirm from "src/components/BatchDeleteConfirm"
import PropTypes from "prop-types"


export default class FileAttachmentBase extends Component {

    static propTypes = {
        personal: PropTypes.bool,
    };

    static defaultProps = {
        personal: true,
    };


    state = {
        loading: false,     // 表格加载数据loading
        file_type: 10,     // 素材类型
        dataSource: [],     // 表格数据
        selectedRowKeys: [],// 表格中选中行keys
        total: 0,           // 分页中条数
        pageNum: 1,         // 分页当前页
        pageSize: 10,       // 分页每页显示条数
        deleting: false,    // 批量删除中loading
        id: null,           // 需要修改的数据id
        ordering: null,           // 排序
        groupIndexVisible: null,           // 分组管理
        addGroupVisible: null,           // 添加分组
        visible: null,
        user_options: [],           // 用户选项
        group_options: [{'value': 'all', 'label': '全部'}, {'value': 'None', 'label': '无分组'}],           // 分组选项
        selected_group: 'all',  // 选择的分组
    };

    handleTableColumn = () => {
        let columns = [
            { title: '名称', dataIndex: 'file_name', sorter: true, width: 200,
                render: (value, record) => {
                    const renderIcon = (<Image src={handleFileTypeIcon(value)}/>);
                    return <span>{renderIcon} <a  rel="noreferrer" href={`${baseURL}media/${record.file_path}`} target='_blank'>{value }</a></span>;
                }
            },
            { title: '大小', dataIndex: 'file_size', sorter: true, width: 100 },
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
            {
                title: '操作', dataIndex: 'operator', width: 120,
                render: (value, record) => {
                    const { id, file_name } = record;
                    const items = [
                        {
                            label: '删除',
                            color: 'red',
                            confirm: {
                                title: `您确定删除"${file_name}"?`,
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

    handleGroupOptions = () => {
        getFileGroupList({'not_page': true, 'group_type': this.state.file_type, 'personal': this.props.personal})
            .then(res => {
                const data = res.data;
                const group_options = [{'value': 'all', 'label': '全部'}, {'value': 'None', 'label': '无分组'}];
                data.results.forEach(function (item) {
                    group_options.push({'value': item.id, 'label': item.name})
                });
                this.setState({ group_options: group_options });
            }, error => {
                console.log(error.response);
            })
    };

    handleSelectedGroup = (group, checked) => {
        let selected_group = this.state.selected_group;
        if (checked) {
            selected_group = group.value;
        }else {
            selected_group = 'all';
        }
        this.setState({ selected_group: selected_group });
        this.handleSubmit();
    };

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
        let group_value = this.state.selected_group;
        let params = {
            ...values,
            personal: this.props.personal,
            group: group_value,
            file_type: this.state.file_type,
            page: this.state.pageNum,
            page_size: this.state.pageSize,
        };
        if (group_value === 'all') {
            delete params['group'];
        }
        if (this.state.ordering) {
            params['ordering'] = this.state.ordering;
        }
        this.setState({ loading: true });
        getFileAttachmentList(params)
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

    componentDidMount() {
        this.handleUserOptions();
        this.handleGroupOptions();
        this.handleSubmit();
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
        deleteFileAttachment(id)
            .then(res => {
                const data = res.data;
                notification.success({
                    message: '删除附件',
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
        console.log('selectedRowKeys', selectedRowKeys);
        batchDeleteConfirm(selectedRowKeys.length)
            .then(() => {
                bulkDeleteFileAttachment({'deleted_objects': selectedRowKeys})
                    .then(res => {
                        const data = res.data;
                        notification.success({
                            message: '批量删除附件',
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
            group_options,
            file_type,
            selected_group,
            addGroupVisible,
            groupIndexVisible,
        } = this.state;
        const formProps = {
            width: 200,
        };

        const { CheckableTag } = Tag;
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
                                placeholder="名称"
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
                                <Button type="primary"  onClick={() => this.setState({ visible: true })} icon={<UploadOutlined />}>上传附件</Button>
                                <Button danger loading={deleting} disabled={disabledDelete} onClick={this.handleBatchDelete}>删除</Button>
                                <Button type="dashed" onClick={() => this.setState({ addGroupVisible: true })}>添加分组</Button>
                                <Button onClick={() => this.setState({ groupIndexVisible: true })}>分组管理</Button>
                            </FormElement>
                        </FormRow>
                    </Form>
                </QueryBar>

                <QueryBar>
                    <Form>
                        <FormRow>
                            <FormElement layout>
                                {group_options.map(group => (
                                    <CheckableTag
                                        key={group.value}
                                        checked={selected_group === group.value}
                                        onChange={checked => this.handleSelectedGroup(group, checked)}
                                    >
                                        {group.label}
                                    </CheckableTag>
                                ))}
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

                <UploadModal
                    visible={visible}
                    file_type={file_type}
                    selected_group={selected_group}
                    onCancel={() => this.setState({ visible: false }, () => this.handleSubmit())}
                    width={'60%'}
                />

                <GroupEditModal
                    visible={addGroupVisible}
                    group_type={this.state.file_type}
                    onOk={() => this.setState({ addGroupVisible: false }, () => this.handleGroupOptions())}
                    onCancel={() => this.setState({ addGroupVisible: false })}
                />

                <GroupIndexModal
                    visible={groupIndexVisible}
                    group_type={this.state.file_type}
                    onOk={() => this.setState({ groupIndexVisible: false }, () => this.handleGroupOptions())}
                    onCancel={() => this.setState({ groupIndexVisible: false }, () => this.handleGroupOptions())}
                    width={'60%'}
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