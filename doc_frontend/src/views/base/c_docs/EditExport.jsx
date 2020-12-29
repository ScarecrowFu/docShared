import React, {Component} from 'react';
import {Alert, Form, notification} from 'antd';
import config from 'src/utils/Hoc/configHoc';
import ModalContent from 'src/library/ModalHoc/ModalContent';
import FormElement from "src/library/FormElement"
import {ExportCDoc, retrieveCDoc} from "src/apis/c_doc"
import {messageDuration} from "src/config/settings";
import { baseURL } from 'src/config/settings';


@config({
    modal: {
        title: '导出文集',
        maskClosable: true
    },
})
class EditExport extends Component {
    state = {
        loading: false, // 页面加载loading
        data: false, // 文集数据
        exportOptions: [
            {'label': 'EPUB', 'value': 'epub'},
            {'label': 'PDF', 'value': 'pdf'},
            {'label': 'Doc', 'value': 'doc'},
            {'label': 'Markdown', 'value': 'md'},
        ],
    };

    componentDidMount() {
        this.fetchData();
    }

    fetchData = () => {
        if (this.state.loading) return;
        const {id} = this.props;
        this.setState({loading: true});
        retrieveCDoc(id)
            .then(res => {
                const data = res.data;
                let results = data.results
                this.setState({data: results});
                this.form.setFieldsValue({...results, 'export_type': 'md'});
            }, error => {
                console.log(error.response);
            })
            .finally(() => this.setState({loading: false}));
    };

    handleSubmit = async (values) => {
        if (this.state.loading) return;
        const {id} = this.props;
        const successTip = '导出文集' ;
        this.setState({loading: true});
        let params = {
            ...values,
            'status': '20'
        }
        await ExportCDoc(id, params)
            .then(res => {
                const data = res.data;
                const url = data.results;
                const {onOk} = this.props;
                let link = document.createElement("a");
                link.setAttribute("href", baseURL+url);
                link.setAttribute("download", baseURL+url);
                link.style.display = "none";
                document.body.appendChild(link);
                link.click();
                URL.revokeObjectURL(baseURL+url); // 释放URL 对象
                document.body.removeChild(link);
                onOk && onOk();
                notification.success({
                    message: successTip,
                    description: data.messages,
                    duration: messageDuration,
                });
            }, error => {
                console.log(error.response);
            })
            .finally(() => this.setState({loading: false}));

    };

    render() {
        const {onCancel} = this.props;
        const {loading, exportOptions, data } = this.state;
        const formProps = {
            labelWidth: 100,
        };
        return (
            <ModalContent
                loading={loading}
                okText="确定"
                cancelText="取消"
                onOk={() => this.form.submit()}
                onCancel={onCancel}
            >
                <Form
                    ref={form => this.form = form}
                    onFinish={this.handleSubmit}
                    initialValues={data}
                >
                    <FormElement {...formProps} type="hidden" name="id"/>
                    <FormElement
                        {...formProps}
                        label="文集名称"
                        name="name"
                        noSpace
                        disabled={true}
                    />
                    <FormElement
                        {...formProps}
                        type="textarea"
                        label="文集简介"
                        name="intro"
                        noSpace
                        disabled={true}
                    />
                    <FormElement
                        {...formProps}
                        showSearch
                        type="select"
                        label="选择文件格式"
                        name="export_type"
                        required
                        options={exportOptions}
                    />
                </Form>
                <Alert
                    message="Tips"
                    description="目前仅支持导出markdown格式文件, 其他文件将在后续增加"
                    type="warning"
                    showIcon
                    closable
                />
            </ModalContent>
        );
    }
}

export default EditExport;