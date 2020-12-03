import React, {Component} from 'react';
import {Form, notification} from 'antd';
import FormElement from 'src/library/FormElement';
import config from 'src/utils/Hoc/configHoc';
import ModalContent from 'src/library/ModalHoc/ModalContent';
import { createFileGroup, retrieveFileGroup, updateFileGroup } from 'src/apis/file';
import {messageDuration} from "src/config/settings"


@config({
    modal: {
        title: props => props.isEdit ? '修改分组' : '添加分组',
        maskClosable: true
    },
})
class GroupEditModal extends Component {
    state = {
        loading: false, // 页面加载loading
        group_type: 10,       // 分组类型
        data: {},       // 回显数据
    };

    componentDidMount() {
        const {group_type, isEdit} = this.props;
        this.setState({group_type: group_type});
        if (isEdit) {
            this.fetchData();
        }
    }

    fetchData = () => {
        if (this.state.loading) return;
        const {id} = this.props;
        this.setState({loading: true});
        retrieveFileGroup(id)
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
        const {isEdit} = this.props;
        const {id} = this.props;
        const successTip = isEdit ? '修改成功！' : '添加成功！';
        this.setState({loading: true});
        values['group_type'] = this.state.group_type;
        if (isEdit){
            updateFileGroup(id, values)
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
            createFileGroup(values)
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

export default GroupEditModal;