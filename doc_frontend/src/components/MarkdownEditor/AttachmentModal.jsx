import React, {Component} from 'react';
import config from 'src/utils/Hoc/configHoc';
import ModalContent from 'src/library/ModalHoc/ModalContent';
import {Button, Form, Image, Tabs, Tag} from "antd"
import {handleFileTypeIcon} from "src/views/base/file_attachments/images"
import {baseURL} from "src/config/settings"
import {getFileAttachmentList, getFileGroupList} from "src/apis/file"
import FormRow from "src/library/FormRow"
import FormElement from "src/library/FormElement"
import {UploadOutlined} from "@ant-design/icons"
import QueryBar from "src/library/QueryBar"
import Pagination from "src/library/Pagination"
import Table from "src/library/Table"
import './style.less'
import UploadModal from "src/views/base/file_attachments/UploadModal"
import {getSiteInfo} from "src/utils/info";


@config({
    modal: {
        title: '插入',
        maskClosable: true
    },
})
class AttachmentModal extends Component {
    state = {
        loading: false, // 页面加载loading
        visible: false, // 上传框
        selectedRowKeys: [],       // 素材ID
        file_attachments: [],       // 素材
        selected_attachments: [],// 选中行keys
        total: 0,           // 分页中条数
        pageNum: 1,         // 分页当前页
        pageSize: 15,       // 分页每页显示条数
        group_options: [{'value': 'all', 'label': '全部'}, {'value': 'None', 'label': '无分组'}],           // 分组选项
        selected_group: 'all',  // 选择的分组
        current_tab: 'select',  // 当前tab
    };

    columns = [
        { title: '名称', dataIndex: 'file_name', sorter: true, width: 200,
            render: (value, record) => {
                if (this.props.file_type === 20) {
                    return <Image src={`${baseURL}media/${record.file_path}`}/>;
                }else {
                    const renderIcon = (<Image src={handleFileTypeIcon(value)}/>);
                    return <span>{renderIcon} <a  rel="noreferrer" href={`${baseURL}media/${record.file_path}`} target='_blank'>{value }</a></span>;
                }

            }
        },
        { title: '大小', dataIndex: 'file_size', sorter: true, width: 100 },
        { title: '创建时间', dataIndex: 'created_time', sorter: true, width: 100 },
    ];

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
            group: group_value,
            file_type: this.props.file_type,
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
                const file_attachments = data?.results || [];
                const total = data?.all_count || 0;
                this.setState({ file_attachments, total });
            }, error => {
                console.log(error.response);
            })
            .finally(() => this.setState({ loading: false }));
    };

    handleGroupOptions = () => {
        getFileGroupList({'not_page': true, 'group_type': this.props.file_type, 'personal': true})
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
        let selected_group = 'all';
        if (checked) {
            selected_group = group.value;
        }
        this.setState({ selected_group: selected_group });
        this.handleSubmit();
    };

    handleSelectedImages = (imageItem, checked) => {
        const { selected_attachments } = this.state;
        const nextSelectedImages = checked ? [...selected_attachments, imageItem] : selected_attachments.filter(t => t !== imageItem);
        this.setState({ selected_attachments: nextSelectedImages });
    };

    handleSelectedAttachments = (selectedRowKeys, selectedRows) => {
        // console.log(selectedRowKeys, selectedRows);
        this.setState({ selectedRowKeys: selectedRowKeys });
        this.setState({ selected_attachments: selectedRows });
    };

    handleTabChange = (activeKey) => {
        this.setState({ current_tab: activeKey });
    }

    handleOkSubmit = async () => {
        const {
            selected_attachments,
            current_tab,
        } = this.state;
        const {file_type, insertFunction} = this.props;
        if (current_tab === 'select') {
            insertFunction(selected_attachments, file_type, current_tab);
        } else {
            await this.link_form.validateFields().then(values => {
                // console.log('values', values);
                insertFunction([values], file_type, current_tab);
            }, error => {
                console.log(error.response);
            }).catch(function (error) {
                console.log(error);
            });

        }
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

    componentDidMount() {
        const {file_type} = this.props;
        let siteInfo = getSiteInfo();
        let title = siteInfo ? siteInfo?.site_name : 'docShared';
        if (file_type === 20) {
            document.title = `${title} 插入图片`;
        } else {
            document.title = `${title} 插入附件`;
        }
        this.handleGroupOptions();
        this.handleSubmit();
    }

    render() {
        const {onCancel, file_type} = this.props;
        const {
            loading,
            selectedRowKeys,
            file_attachments,
            total,
            pageNum,
            pageSize,
            group_options,
            selected_group,
            selected_attachments,
            visible,
        } = this.state;
        const { TabPane } = Tabs;
        const formProps = {
            width: 200,
        };
        const { CheckableTag } = Tag;

        return (
            <ModalContent
                loading={loading}
                okText="插入"
                cancelText="取消"
                onOk={() => this.handleOkSubmit()}
                onCancel={onCancel}
            >
                <Tabs defaultActiveKey="select" onChange={this.handleTabChange}>
                    <TabPane tab={file_type === 20 ? '选择图片' : '选择附件'} key="select">
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
                                        width={300}
                                        type="date-range"
                                        label="创建时间"
                                        name="created_time"
                                    />
                                    <FormElement layout>
                                        <Button type="primary" htmlType="submit">搜索</Button>
                                        <Button onClick={() => {this.form.resetFields(); this.handleSubmit();}}>重置</Button>
                                        <Button type="primary"  onClick={() => this.setState({ visible: true })} icon={<UploadOutlined />}>{file_type === 20 ? '上传图片' : '上传附件'}</Button>
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

                        {file_type === 20 ?
                            (file_attachments.map(attachment => (
                                <CheckableTag
                                    styleName="image-item"
                                    key={attachment.id}
                                    checked={selected_attachments.indexOf(attachment) > -1}
                                    onChange={checked => this.handleSelectedImages(attachment, checked)}
                                >
                                    <Image
                                        width={150}
                                        height={150}
                                        preview={false}
                                        src={`${baseURL}media/${attachment.file_path}`}
                                    />
                                </CheckableTag>
                            )))
                            :
                            <Table
                                rowSelection={{
                                    selectedRowKeys,
                                    onChange: this.handleSelectedAttachments,
                                }}
                                loading={loading}
                                columns={this.columns}
                                dataSource={file_attachments}
                                rowKey="id"
                                serialNumber={false}
                                pageNum={pageNum}
                                pageSize={pageSize}
                                showSorterTooltip={true}
                                onChange={this.handleTableChange}
                            />
                        }

                        <Pagination
                            total={total}
                            pageNum={pageNum}
                            pageSize={pageSize}
                            onPageNumChange={pageNum => this.setState({ pageNum }, () => this.handleSubmit())}
                            onPageSizeChange={pageSize => this.setState({ pageSize, pageNum: 1 })}
                        />
                    </TabPane>

                    <TabPane tab={file_type === 20 ? '插入外链图片' : '插入外链附件'} key="link">
                        <Form ref={link_form => this.link_form = link_form}>
                            <FormRow>
                                <FormElement
                                    label={file_type === 20 ? '图片描述' : '附件描述'}
                                    name="file_name"
                                    placeholder={file_type === 20 ? '图片描述' : '附件描述'}
                                    required
                                    noSpace
                                />
                            </FormRow>
                            <FormRow>
                                <FormElement
                                    label={file_type === 20 ? '图片链接' : '附件链接'}
                                    name="file_url"
                                    placeholder="图片链接"
                                    required
                                    noSpace
                                />
                            </FormRow>
                        </Form>
                    </TabPane>
                </Tabs>

                <UploadModal
                    visible={visible}
                    file_type={file_type}
                    selected_group={selected_group}
                    onCancel={() => this.setState({ visible: false }, () => this.handleSubmit())}
                    width={'60%'}
                />
            </ModalContent>
        );
    }
}

export default AttachmentModal;