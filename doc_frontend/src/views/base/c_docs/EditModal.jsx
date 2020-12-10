import React, {Component} from 'react';
import {Form, notification} from 'antd';
import FormElement from 'src/library/FormElement';
import config from 'src/utils/Hoc/configHoc';
import ModalContent from 'src/library/ModalHoc/ModalContent';
import { createCDoc, retrieveCDoc, updateCDoc } from 'src/apis/c_doc';
import {messageDuration} from "src/config/settings"

@config({
    modal: {
        title: props => props.isEdit ? '修改文集' : '添加文集',
        maskClosable: true
    },
})
class EditModal extends Component {
    state = {
        loading: false, // 页面加载loading
        data: {},       // 回显数据
    };

    componentDidMount() {
        const {isEdit} = this.props;

        if (isEdit) {
            this.fetchData();
        }
    }

    fetchData = () => {
        if (this.state.loading) return;
        const {id} = this.props;
        this.setState({loading: true});
        retrieveCDoc(id)
            .then(res => {
                const data = res.data;
                this.setState({data: data.results});
                this.form.setFieldsValue(data.results);
            }, error => {
                console.log(error.response);
            })
            .finally(() => this.setState({loading: false}));
    };

    handleSubmit = (values) => {
        if (this.state.loading) return;
        const {isEdit, handleCreatedCDoc} = this.props;
        const {id} = this.props;
        const successTip = isEdit ? '修改成功！' : '添加成功！';
        this.setState({loading: true});
        if (isEdit){
            updateCDoc(id, values)
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
            createCDoc(values)
                .then(res => {
                    const data = res.data;
                    const {onOk} = this.props;
                    onOk && onOk();
                    notification.success({
                        message: successTip,
                        description: data.messages,
                        duration: messageDuration,
                    });
                    if (handleCreatedCDoc) {
                        handleCreatedCDoc(data.results.id)
                    }
                }, error => {
                    console.log(error.response);
                })
                .finally(() => this.setState({loading: false}));

        }

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
                resetText={isEdit ? null : "重置"}
                onOk={() => this.form.submit()}
                onCancel={onCancel}
                onReset={isEdit ? null : () => this.form.resetFields()}
            >
                <Form
                    ref={form => this.form = form}
                    onFinish={this.handleSubmit}
                    initialValues={data}
                >
                    {isEdit ? <FormElement {...formProps} type="hidden" name="id"/> : null}

                    <FormElement
                        {...formProps}
                        label="名称"
                        name="name"
                        required
                        noSpace
                    />
                    <FormElement
                        {...formProps}
                        type="textarea"
                        label="简介"
                        name="intro"
                        noSpace
                    />
                </Form>
            </ModalContent>
        );
    }
}

export default EditModal;