import React, {Component} from 'react';
import {Button, Form, notification, Tooltip, Modal} from 'antd';
import FormElement from 'src/library/FormElement';
import config from 'src/utils/Hoc/configHoc';
import ModalContent from 'src/library/ModalHoc/ModalContent';
import { createDocTemplate, retrieveDocTemplate, updateDocTemplate, getDocTemplateList } from 'src/apis/doc';
import {messageDuration} from "src/config/settings"
import {ImportOutlined} from "@ant-design/icons";
import MarkdownEditor from 'src/components/MarkdownEditor'
import './style.less'


@config({
    modal: {
        title: props => props.isEdit ? '修改模板' : '添加模板',
        maskClosable: true
    },
})
class EditModal extends Component {
    state = {
        loading: false, // 页面加载loading
        data: {},       // 回显数据
        content: '',  // 模板内容
        visible: '',  // 选择其他模板
        template_options: [],  // 文档模板选项
    };

    componentDidMount() {
        const {isEdit} = this.props;
        this.handleTemplateOptions();
        if (isEdit) {
            this.fetchData();
        }
    }

    handleTemplateOptions = () => {
        getDocTemplateList({'not_page': true})
            .then(res => {
                const data = res.data;
                const template_options = [];
                data.results.forEach(function (item) {
                    template_options.push({'value': item.id, 'label': item.name})
                });
                this.setState({ template_options: template_options });
            }, error => {
                console.log(error.response);
            })
    };

    handleTemplateOptionOk =  async () => {
        const values = await  this.templateForm.validateFields();
        this.setState({loading: true});
        retrieveDocTemplate(values.template)
            .then(res => {
                const data = res.data;
                this.setState({content: data.results.content});
            }, error => {
                console.log(error.response);
            })
            .finally(() => this.setState({loading: false}));
        this.setState({visible: false});
    };

    fetchData = () => {
        if (this.state.loading) return;
        const {id} = this.props;
        this.setState({loading: true});
        retrieveDocTemplate(id)
            .then(res => {
                const data = res.data;
                this.setState({data: data.results});
                this.setState({content: data.results.content});
                this.form.setFieldsValue(data.results);
            }, error => {
                console.log(error.response);
            })
            .finally(() => this.setState({loading: false}));
    };

    handleSubmit = (values) => {
        if (this.state.loading) return;
        const {isEdit} = this.props;
        const {id} = this.props;
        const successTip = isEdit ? '修改成功！' : '添加成功！';
        this.setState({loading: true});
        values['content'] = this.state.content;
        if (isEdit){
            updateDocTemplate(id, values)
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
        } else {
            createDocTemplate(values)
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
        }

    };

    handleContentChange = (values) => {
        this.setState({content: values});
    };

    render() {
        const {isEdit, onCancel} = this.props;
        const {loading, data } = this.state;
        const formProps = {
            labelWidth: 100,
        };
        return (
            <ModalContent
                loading={loading}
                okText={isEdit ? "修改" : "保存"}
                cancelText="取消"
                onOk={() => this.form.submit()}
                onCancel={onCancel}
            >
                <Form
                    ref={form => this.form = form}
                    onFinish={this.handleSubmit}
                    initialValues={data}
                >
                    {isEdit ?
                        <FormElement {...formProps} type="hidden" name="id"/> :
                        null
                    }
                    <div styleName="flex-container">
                        <div styleName="flex-item-left">
                            <Tooltip title="导入模板内容">
                                <Button type="primary" shape="circle" icon={<ImportOutlined />}
                                        onClick={() => this.setState({ visible: true})} />
                            </Tooltip>
                        </div>
                        <div styleName="flex-item-right">
                            <FormElement
                                {...formProps}
                                label="名称"
                                name="name"
                                required
                                noSpace
                            />
                        </div>
                    </div>
                    <MarkdownEditor
                        content={this.state.content}
                        handleContentChange={this.handleContentChange}
                    />
                </Form>
                <Modal
                    title="选择文档模板"
                    visible={this.state.visible}
                    onOk={this.handleTemplateOptionOk}
                    onCancel={() => this.setState({ visible: false})}
                >
                    <Form
                        ref={templateForm => this.templateForm = templateForm}
                    >
                        <FormElement
                            {...formProps}
                            type="select"
                            label="文档模板"
                            name="template"
                            options={this.state.template_options}
                        />
                    </Form>
                </Modal>
            </ModalContent>
        );
    }
}

export default EditModal;