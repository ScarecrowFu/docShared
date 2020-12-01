import React, {Component} from 'react';
import {Button, Form, notification, Tag, Upload} from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import PageContent from 'src/layouts/PageContent';
import config from 'src/utils/Hoc/configHoc';
import QueryBar from 'src/library/QueryBar';
import FormRow from 'src/library/FormRow';
import FormElement from 'src/library/FormElement';
import { PlusOutlined } from '@ant-design/icons';
import Pagination from 'src/library/Pagination';
import batchDeleteConfirm from 'src/components/BatchDeleteConfirm';
import {bulkDeleteFileAttachment, deleteFileAttachment, getFileAttachmentList, getFileGroupList } from 'src/apis/file';
import {getUserList} from 'src/apis/user';
import {messageDuration} from "src/config/settings";
import './style.less'



@config({
    path: '/admin/attachments/images',
    title: {text: '图片管理', icon: 'picture'},
    breadcrumbs: [{key: 'image', text: '图片管理', icon: 'picture'}],
})
class FileImages extends Component {
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
        group_options: [{'value': 'all', 'label': '全部'}, {'value': 'None', 'label': '无分组'}],           // 分组选项
        selectedGroups: [],  // 选择的分组

    };

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

    handleGroupOptions = () => {
        getFileGroupList({'not_page': true})
            .then(res => {
                const data = res.data;
                const group_options = [{'value': 'all', 'label': '全部'}, {'value': 'None', 'label': '无分组'}];
                data.results.forEach(function (item) {
                    group_options.push({'value': item.id, 'label': item.name})
                })
                this.setState({ group_options: group_options });
            }, error => {
                console.log(error.response);
            })
    }

    handleSelectedGroup = (group, checked) => {
        const selectedGroups = this.state.selectedGroups;
        if (checked) {
            selectedGroups.push(group.value)
        }else {
            const index = selectedGroups.indexOf(group.value);
            if (index > -1) {
                selectedGroups.splice(index, 1);
            }
        }
        this.setState({ selectedGroups: selectedGroups });
    }

    componentDidMount() {
        this.handleUserOptions();
        this.handleGroupOptions();
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
            group_options,
            selectedGroups,
        } = this.state;

        const formProps = {
            width: 200,
        };
        const disabledDelete = !selectedRowKeys?.length;

        const { CheckableTag } = Tag;

        const imagesData = [
            {
                uid: '-1',
                name: 'image.png',
                status: 'done',
                url: 'https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png',
            }
            ];

        const uploadButton = (
            <div>
                <PlusOutlined />
                <div style={{ marginTop: 8 }}>Upload</div>
            </div>
        );

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
                                <Upload><Button type="primary" icon={<UploadOutlined />}>上传图片</Button></Upload>
                                <Button type="dashed" onClick={() => this.form.resetFields()}>添加分组</Button>
                                <Button onClick={() => this.form.resetFields()}>分组管理</Button>
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
                                        checked={selectedGroups.indexOf(group.value) > -1}
                                        onChange={checked => this.handleSelectedGroup(group, checked)}
                                    >
                                        {group.label}
                                    </CheckableTag>
                                ))}
                            </FormElement>
                        </FormRow>
                    </Form>
                </QueryBar>

                <Upload
                    className="image-uploader"
                    action="https://www.mocky.io/v2/5cc8019d300000980a055e76"
                    listType="picture-card"
                    fileList={imagesData}
                >
                    {uploadButton}
                </Upload>


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

export default FileImages;