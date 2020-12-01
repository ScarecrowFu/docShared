import React, {Component} from 'react';
import {Form, notification} from 'antd';
import FormElement from 'src/library/FormElement';
import config from 'src/utils/Hoc/configHoc';
import ModalContent from 'src/library/ModalHoc/ModalContent';
import { createDocTag, retrieveDocTag, updateDocTag } from 'src/apis/doc';
import {messageDuration} from "src/config/settings"


@config({
    modal: {
        title: props => props.isEdit ? '修改标签' : '添加标签',
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
        retrieveDocTag(id)
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
        values['content'] = this.state.content
        if (isEdit){
            updateDocTag(id, values)
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
            createDocTag(values)
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
                    {isEdit ? <FormElement {...formProps} type="hidden" name="id"/> : null}

                    <FormElement
                        {...formProps}
                        label="名称"
                        name="name"
                        required
                        noSpace
                    />
                </Form>
            </ModalContent>
        );
    }
}

export default EditModal;