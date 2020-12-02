import React, {Component} from 'react';
import {Button, Form, notification, Tag, Upload, Modal} from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import PageContent from 'src/layouts/PageContent';
import config from 'src/utils/Hoc/configHoc';
import QueryBar from 'src/library/QueryBar';
import FormRow from 'src/library/FormRow';
import FormElement from 'src/library/FormElement';
import { PlusOutlined } from '@ant-design/icons';
import Pagination from 'src/library/Pagination';
import { getFileGroupList, createFileAttachment, getFileAttachmentList } from 'src/apis/file';
import {getUserList} from 'src/apis/user';
import {messageDuration, baseURL} from "src/config/settings";
import {computeMD5, getBase64} from 'src/utils/md5'
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
        previewVisible: null,           // 查看大图
        previewTitle: null,           // 大图名称
        previewImage: null,           // 大图URL
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

    fetchData = () => {
        if (this.state.loading) return;
        const {id} = this.props;
        this.setState({loading: true});
        getFileAttachmentList(id)
            .then(res => {
                const data = res.data;
                let dataSource = []
                data.results.forEach(function (item) {
                    dataSource.push(
                        {
                            uid: item.id, // 注意，这个uid一定不能少，否则上传失败
                            name: item.file_name,
                            status: 'done',
                            url: `${baseURL}media/${item.file_path}`,
                        }
                    )
                });
                this.setState({dataSource: dataSource});
            }, error => {
                console.log(error.response);
            })
            .finally(() => this.setState({loading: false}));
    };

    componentDidMount() {
        this.handleUserOptions();
        this.handleGroupOptions();
        this.fetchData();
    }

    // 方法：图片预览
    handlePreview = async (file) => {
        console.log('handlePreview:' + JSON.stringify(file));
        if (!file.url && !file.preview) {
            file.preview = await getBase64(file.originFileObj);
        }
        this.setState({
            previewImage: file.url || file.preview,
            previewVisible: true,
            previewTitle: file.name || file.url.substring(file.url.lastIndexOf('/') + 1),
        });
    };

    // 上传前处理, 相关限制
    handleBeforeUpload = (file) => {
        console.log('handleBeforeUpload file:' + JSON.stringify(file));
        console.log('handleBeforeUpload file.file:' + JSON.stringify(file.file));
        console.log('handleBeforeUpload file type:' + JSON.stringify(file.type));
        //限制图片 格式、size、分辨率
        const isJPG = file.type === 'image/jpeg';
        const isJPEG = file.type === 'image/jpeg';
        const isGIF = file.type === 'image/gif';
        const isPNG = file.type === 'image/png';
        const isLt2M = file.size / 1024 / 1024 < 10;
        if (!(isJPG || isJPEG || isPNG || isGIF)) {
            notification.error({
                message: '文件格式错误',
                description: '只能上传JPG、JPEG、PNG、GIF 格式的图片',
                duration: messageDuration,
            });
        } else if (!isLt2M) {
            notification.error({
                message: '文件大小错误',
                description: '图片超过10M限制，不允许上传',
                duration: messageDuration,
            });
        }
        return (isJPG || isJPEG || isPNG) && isLt2M;
    };


    handleChange = ({ file, fileList }) => {
        console.log('handleChange file:' + JSON.stringify(file));
        console.log('handleChange fileList:' + JSON.stringify(fileList));
        console.log('file.status', file.status);
        if (file.status === 'removed') {
            this.setState({
                dataSource: [],
            });
        }
    };

    // 图片上传
    handleImgUpload = async (options) => {
        const { onProgress, onError, onSuccess, data, filename, file, withCredentials, action, headers } = options;
        const file_md5_info = await computeMD5(file);
        const {file_name, file_md5, chunks_info, chunks_num} = file_md5_info;
        console.log('file_md5_info', file_md5_info);
        const file_id = file.uid;
        // 新建图片对象
        const image = {
            uid: file.uid, // 注意，这个uid一定不能少，否则上传失败
            name: file_name,
            status: 'uploading',
            url: '',
            percent: 1, // 注意不要写100。100表示上传完成
        };

        let dataSource = this.state.dataSource;
        dataSource.push(image)
        this.setState({ dataSource: dataSource });

        const reader = new FileReader();
        reader.readAsDataURL(file); // 读取图片文件
        reader.onload = (file) => {
            console.log('reader.onload');
            const _that = this;
            chunks_info.forEach(function (item) {
                let percent = item.chunk_index / chunks_num;
                const fmData = new FormData();
                const chunk_file = new Blob([item.chunk_file], {type: 'application/octet-stream'})
                fmData.append("group", null);
                fmData.append("file_type", 20);
                fmData.append("chunk_file", chunk_file);
                fmData.append("chunk_md5", item.chunk_md5);
                fmData.append("chunk_index", item.chunk_index);
                fmData.append("chunks_num", chunks_num);
                fmData.append("file_name", file_name);
                fmData.append("file_md5", file_md5);
                createFileAttachment(fmData,  { "content-type": "multipart/form-data" })
                    .then(res => {
                        const data = res.data;
                        const {uploaded, file_path} = data.results;
                        let image = {
                            uid: file_id,
                            name: file_name,
                            status: 'uploading',
                            url: '',
                            percent: percent,
                        };
                        if (uploaded) {
                            _that.fetchData();
                            // image = {
                            //     uid: file_id,
                            //     name: file_name,
                            //     status: 'done',
                            //     url: `${baseURL}media/${file_path}`,
                            //     percent: percent,
                            // };
                        }
                        dataSource = dataSource.filter(function( obj ) {
                            return obj.uid !== file_id;
                        });
                        dataSource.push(image)
                        _that.setState({ dataSource: dataSource });
                    }, error => {
                        dataSource = dataSource.filter(function( obj ) {
                            return obj.uid !== file_id;
                        });
                        _that.setState({ dataSource: dataSource });
                        console.log(error.response);
                        onError({ error });
                    });
            });
        };
    };

    handlePreviewCancel = () => this.setState({ previewVisible: false });

    handlePreviewDownload = () => {
        const {
            previewTitle,
            previewImage,
        } = this.state;
        let link = document.createElement("a");
        link.setAttribute("href", previewImage);
        link.setAttribute("download", previewTitle);
        link.setAttribute("target", '_blank');
        link.style.display = "none";
        document.body.appendChild(link);
        link.click();
        URL.revokeObjectURL(previewImage); // 释放URL 对象
        document.body.removeChild(link);
    }


    render() {
        const {
            total,
            pageNum,
            pageSize,
            group_options,
            selectedGroups,
            dataSource,
            previewVisible,
            previewTitle,
            previewImage,
        } = this.state;
        const formProps = {
            width: 200,
        };

        const { CheckableTag } = Tag;
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
                                <Upload
                                    customRequest={this.handleImgUpload}
                                    onPreview={this.handlePreview}
                                    beforeUpload={this.handleBeforeUpload}
                                    onChange={this.handleChange}
                                ><Button type="primary" icon={<UploadOutlined />}>上传图片</Button></Upload>
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
                    listType="picture-card"
                    fileList={dataSource}
                    customRequest={this.handleImgUpload}
                    onPreview={this.handlePreview}
                    beforeUpload={this.handleBeforeUpload}
                    onChange={this.handleChange}
                >
                    {uploadButton}
                </Upload>

                <Modal
                    visible={previewVisible}
                    title={previewTitle}
                    onCancel={this.handlePreviewCancel}
                    footer={[
                        <Button key="previewDownload" onClick={this.handlePreviewDownload}>
                            下载
                        </Button>,
                        <Button key="PreviewCancel" onClick={this.handlePreviewCancel}>
                            取消
                        </Button>
                    ]}
                    width={"60%"}
                >
                    <img alt="preview" style={{ width: '100%' }} src={previewImage} />
                </Modal>

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