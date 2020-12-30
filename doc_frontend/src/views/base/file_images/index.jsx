import React, {Component} from 'react';
import {Button, Form, notification, Tag, Upload, Modal} from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import PageContent from 'src/layouts/PageContent';
import QueryBar from 'src/library/QueryBar';
import FormRow from 'src/library/FormRow';
import FormElement from 'src/library/FormElement';
import { PlusOutlined } from '@ant-design/icons';
import Pagination from 'src/library/Pagination';
import { getFileGroupList, createFileAttachment, getFileAttachmentList, deleteFileAttachment } from 'src/apis/file';
import {getUserList} from 'src/apis/user';
import {messageDuration, baseURL} from "src/config/settings";
import {computeMD5, getBase64} from 'src/utils/md5';
import GroupEditModal from './GroupEditModal';
import GroupIndexModal from './GroupIndexModal';
import './style.less'
import PropTypes from "prop-types"


export default class FileImagesBase extends Component {
    static propTypes = {
        personal: PropTypes.bool,
    };

    static defaultProps = {
        personal: true,
    };


    state = {
        loading: false,     // 表格加载数据loading
        file_type: 20,     // 素材类型
        dataSource: [],     // 表格数据
        selectedRowKeys: [],// 表格中选中行keys
        total: 0,           // 分页中条数
        pageNum: 1,         // 分页当前页
        pageSize: 20,       // 分页每页显示条数
        deleting: false,    // 批量删除中loading
        id: null,           // 需要修改的数据id
        ordering: null,           // 排序
        groupIndexVisible: null,           // 分组管理
        addGroupVisible: null,           // 添加分组
        previewVisible: null,           // 查看大图
        previewTitle: null,           // 大图名称
        previewImage: null,           // 大图URL
        user_options: [],           // 用户选项
        group_options: [{'value': 'all', 'label': '全部'}, {'value': 'None', 'label': '无分组'}],           // 分组选项
        selected_group: 'all',  // 选择的分组
    };

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
                let dataSource = [];
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
                const total = data?.all_count || 0;
                this.setState({dataSource: dataSource});
                this.setState({total: total});
            }, error => {
                console.log(error.response);
            })
            .finally(() => this.setState({ loading: false }));
    };

    componentDidMount() {
        this.handleUserOptions();
        this.handleGroupOptions();
        this.handleSubmit();
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
    };

    handleRemove = (file)=>{
        console.log('remove', file);
        const {confirm} = Modal;
        return new Promise((resolve, reject) => {
            confirm({
                title: '是否确定删除该图片?',
                onOk: () => {
                    deleteFileAttachment(file.uid)
                        .then(res => {
                            const data = res.data;
                            notification.success({
                                message: '删除图片',
                                description: data.messages,
                                duration: messageDuration,
                            });
                            this.handleSubmit();
                        }, error => {
                            console.log(error.response);
                        })
                        .finally(() => this.setState({ deleting: false }));
                    resolve(true);
                },
                onCancel: () =>{
                    resolve(false);
                }
            })
        })
    };

    // 图片上传
    handleImgUpload = async (options) => {
        const { onError, file, } = options;
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
        dataSource.push(image);
        this.setState({ dataSource: dataSource });

        let group_value = this.state.selected_group;
        if (group_value === 'all' || group_value === 'None') {
            group_value = null;
        }
        const reader = new FileReader();
        reader.readAsDataURL(file); // 读取图片文件
        reader.onload = (file) => {
            console.log('reader.onload');
            const _that = this;
            chunks_info.forEach(function (item) {
                let percent = item.chunk_index / chunks_num;
                const fmData = new FormData();
                const chunk_file = new Blob([item.chunk_file], {type: 'application/octet-stream'});
                fmData.append("group", group_value);
                fmData.append("file_type", _that.state.file_type);
                fmData.append("chunk_file", chunk_file);
                fmData.append("chunk_md5", item.chunk_md5);
                fmData.append("chunk_index", item.chunk_index);
                fmData.append("chunks_num", chunks_num);
                fmData.append("file_name", file_name);
                fmData.append("file_md5", file_md5);
                createFileAttachment(fmData,  { "content-type": "multipart/form-data" })
                    .then(res => {
                        const data = res.data;
                        const {uploaded} = data.results;
                        if (uploaded) {
                            _that.handleSubmit();
                        } else {
                            dataSource = dataSource.filter(function( obj ) {
                                if (obj.uid === file_id) {
                                    obj.percent = percent
                                }
                                return obj;
                            });
                        }
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
    };


    render() {
        const {
            total,
            pageNum,
            pageSize,
            group_options,
            selected_group,
            dataSource,
            groupIndexVisible,
            addGroupVisible,
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
                                <Upload
                                    fileList={[]}
                                    customRequest={this.handleImgUpload}
                                    onPreview={this.handlePreview}
                                    beforeUpload={this.handleBeforeUpload}
                                    onChange={this.handleChange}
                                ><Button type="primary" icon={<UploadOutlined />}>上传图片</Button></Upload>
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

                <Upload
                    className="image-uploader"
                    listType="picture-card"
                    fileList={dataSource}
                    customRequest={this.handleImgUpload}
                    onPreview={this.handlePreview}
                    beforeUpload={this.handleBeforeUpload}
                    onChange={this.handleChange}
                    onRemove={this.handleRemove}
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
            </PageContent>
        );
    }
}