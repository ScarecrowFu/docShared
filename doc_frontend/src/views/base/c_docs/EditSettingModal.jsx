import React, {Component} from 'react';
import {Form, notification, Alert} from 'antd';
import FormElement from 'src/library/FormElement';
import config from 'src/utils/Hoc/configHoc';
import ModalContent from 'src/library/ModalHoc/ModalContent';
import {getCExportSet, saveCExportSet} from 'src/apis/c_doc';
import {messageDuration} from "src/config/settings"


@config({
    modal: {
        title: '修改文集设置',
        maskClosable: true
    },
})
class EditSettingModal extends Component {
    state = {
        loading: false, // 页面加载loading
        data: {},       // 回显数据
        exportOptions: [
            {'label': '允许导出EPUB', 'value': 'allow_epub'},
            {'label': '允许导出PDF', 'value': 'allow_pdf'},
            {'label': '允许导出Doc', 'value': 'allow_doc'},
            {'label': '允许导出Markdown', 'value': 'allow_markdown'},
            ]
    };

    componentDidMount() {
        this.fetchData();
    }

    fetchData = () => {
        if (this.state.loading) return;
        const {id} = this.props;
        this.setState({loading: true});
        getCExportSet(id)
            .then(res => {
                const data = res.data;
                let results = data.results
                this.setState({data: results});
                this.form.setFieldsValue(results);
            }, error => {
                console.log(error.response);
            })
            .finally(() => this.setState({loading: false}));
    };

    handleSubmit = (values) => {
        if (this.state.loading) return;
        const {id} = this.props;
        const successTip = '修改文集设置成功！' ;
        let export_params = {};
        if (values.export_set) {
            values.export_set.forEach((item, index) => export_params[item] = true);
        }
        let params = {
            ...export_params
        }
        this.setState({loading: true});
        saveCExportSet(id, params)
            .then(res => {
                const data = res.data;
                const {onOk} = this.props;
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
        const {loading, data } = this.state;
        const formProps = {
            labelWidth: 100,
        };
        const message =  (
            <div>
                <p>导出设置: 文集文档中如果包含公式、流程图、时序图、脑图等内容，将会延长生成时间，请耐心等待</p>
            </div>

        );
        return (
            <ModalContent
                loading={loading}
                okText="修改"
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
                        type="checkbox-group"
                        label="导出设置"
                        name="export_set"
                        options={this.state.exportOptions}
                    />
                </Form>
                <Alert
                    message="Tips"
                    description={message}
                    type="success"
                    showIcon
                    closable
                />
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

export default EditSettingModal;