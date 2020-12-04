import React, {Component} from 'react';
import {Form, notification} from 'antd';
import FormElement from 'src/library/FormElement';
import config from 'src/utils/Hoc/configHoc';
import ModalContent from 'src/library/ModalHoc/ModalContent';
import { createTeamGroup, retrieveTeamGroup, updateTeamGroup } from 'src/apis/team_group';
import {messageDuration} from "src/config/settings"
import {getUserList} from "../../../apis/user"

@config({
    modal: {
        title: props => props.isEdit ? '修改团队' : '添加团队',
        maskClosable: true
    },
})
class EditModal extends Component {
    state = {
        loading: false, // 页面加载loading
        data: {},       // 回显数据
        user_options: [],           // 用户选项
    };

    componentDidMount() {
        this.handleUserOptions();
        const {isEdit} = this.props;
        if (isEdit) {
            this.fetchData();
        }
    }

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

    fetchData = () => {
        if (this.state.loading) return;
        const {id} = this.props;
        this.setState({loading: true});
        retrieveTeamGroup(id)
            .then(res => {
                const data = res.data;
                const members = [];
                data.results.members.forEach(function (item) {
                    members.push(item.id)
                })
                const results = {'id': data.results.id, 'name': data.results.name, 'members': members}
                this.setState({data: results});
                this.form.setFieldsValue(results);
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
        if (isEdit){
            updateTeamGroup(id, values)
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
            createTeamGroup(values)
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
                        type="select"
                        label="用户"
                        name="members"
                        noSpace
                        required
                        mode="multiple"
                        options={this.state.user_options}
                    />
                </Form>
            </ModalContent>
        );
    }
}

export default EditModal;