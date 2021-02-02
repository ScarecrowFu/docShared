import React, {Component} from 'react';
import {Modal, notification, Upload} from 'antd';
import config from 'src/utils/Hoc/configHoc';
import { InboxOutlined } from '@ant-design/icons';
import ModalContent from 'src/library/ModalHoc/ModalContent';
import {messageDuration} from "src/config/settings"
import {createFileAttachment, deleteFileAttachment} from "src/apis/file"
import {computeMD5} from "src/utils/md5"


@config({
    modal: {
        title: '上传附件',
        maskClosable: true
    },
})
class UploadModal extends Component {
    state = {
        loading: false, // 页面加载loading
        dataSource: [],
        selected_group: '',
        file_type: 10,
    };

    componentDidMount() {
        const {file_type, selected_group} = this.props;
        this.setState({file_type: file_type});
        this.setState({selected_group: selected_group});
    }

    // 上传前处理, 相关限制
    handleBeforeUpload = (file) => {
        // console.log('handleBeforeUpload file:' + JSON.stringify(file));
        // console.log('handleBeforeUpload file.file:' + JSON.stringify(file.file));
        // console.log('handleBeforeUpload file type:' + JSON.stringify(file.type));
        if (this.state.file_type === 20) {
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
        } else {
            const isLt2M = file.size / 1024 / 1024  < 200;
            if (!isLt2M) {
                notification.error({
                    message: '文件大小错误',
                    description: '附件超过200M限制，不允许上传',
                    duration: messageDuration,
                });
            }
            return isLt2M;
        }

    };


    handleChange = ({ file, fileList }) => {
        // console.log('handleChange file:' + JSON.stringify(file));
        // console.log('handleChange fileList:' + JSON.stringify(fileList));
        // console.log('file.status', file.status);
        if (file.status === 'removed') {
            this.setState({ dataSource: fileList });
        }
    };

    handleRemove = (file)=>{
        console.log('remove', file);
        const {confirm} = Modal;
        return new Promise((resolve, reject) => {
            confirm({
                title: '是否确定删除该附件?',
                onOk: () => {
                    deleteFileAttachment(file.uid)
                        .then(res => {
                            const data = res.data;
                            notification.success({
                                message: '删除附件',
                                description: data.messages,
                                duration: messageDuration,
                            });
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

    // 上传
    handleFileUpload = async (options) => {
        const { onError, file, } = options;
        const file_id = file.uid;
        // 新建对象
        const image = {
            uid: file.uid, // 注意，这个uid一定不能少，否则上传失败
            name: file.name,
            status: 'uploading',
            url: '',
            percent: 1, // 注意不要写100。100表示上传完成
        };
        let dataSource = this.state.dataSource;
        dataSource.push(image);
        this.setState({ dataSource: dataSource });

        const file_md5_info = await computeMD5(file);
        const {file_name, file_md5, chunks_info, chunks_num} = file_md5_info;
        // console.log('file_md5_info', file_md5_info);

        let group_value = this.state.selected_group;
        if (group_value === 'all' || group_value === 'None') {
            group_value = null;
        }
        const reader = new FileReader();
        reader.readAsDataURL(file); // 读取文件
        reader.onload = (file) => {
            const _that = this;
            chunks_info.forEach(function (item) {
                let percent = (item.chunk_index / chunks_num) * 100;
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
                        const {uploaded, id} = data.results;
                        if (uploaded) {
                            dataSource = dataSource.filter(function( obj ) {
                                if (obj.uid === file_id) {
                                    obj.uid = id
                                    obj.status = 'done'
                                    obj.percent = 100
                                }
                                return obj;
                            });
                        } else {
                            dataSource = dataSource.filter(function( obj ) {
                                if (obj.uid === file_id) {
                                    obj.percent = percent
                                }
                                return obj;
                            });
                        }
                        console.log('dataSource', dataSource);
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

    render() {
        const {onCancel} = this.props;
        const {loading, dataSource, file_type } = this.state;
        const { Dragger } = Upload;
        return (
            <ModalContent
                loading={loading}
                cancelText="关 闭"
                onCancel={onCancel}
            >
                <Dragger
                    multiple={true}
                    fileList={dataSource}
                    customRequest={this.handleFileUpload}
                    beforeUpload={this.handleBeforeUpload}
                    onChange={this.handleChange}
                    onRemove={this.handleRemove}
                >
                    <p className="ant-upload-drag-icon">
                        <InboxOutlined />
                    </p>
                    <p className="ant-upload-text">Click or drag file to this area to upload</p>
                    <p className="ant-upload-hint">
                        {file_type === 20? '只能上传JPG、JPEG、PNG、GIF 格式的图片, 最大图片限制为200M' : '支持多个或单个文件上传， 最大文件限制为200M'}
                    </p>
                </Dragger>
            </ModalContent>
        );
    }
}

export default UploadModal;