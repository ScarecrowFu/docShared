import React, {Component} from 'react';
import {Alert, Form, notification} from 'antd';
import FormElement from 'src/library/FormElement';
import config from 'src/utils/Hoc/configHoc';
import ModalContent from 'src/library/ModalHoc/ModalContent';
import {createCDocUser, getCDocMemberPermissionTypes, retrieveCDocUser, updateCDocUser} from 'src/apis/c_doc';
import {messageDuration} from "src/config/settings"
import {getUserList} from "../../../apis/user"

@config({
    modal: {
        title: props => props.isEdit ? '修改用户成员' : '添加用户成员',
        maskClosable: true
    },
})
class EditMemberUserModal extends Component {
    state = {
        loading: false, // 页面加载loading
        data: {},       // 回显数据
        user_options: [],           // 用户选项
        member_perm_options: [],           // 成员权限选项
    };

    componentDidMount() {
        const {isEdit} = this.props;
        this.handleUserOptions();
        this.handleUserPermissionOptions();
        if (isEdit) {
            this.fetchData();
        }
    }

    fetchData = () => {
        if (this.state.loading) return;
        const {id} = this.props;
        this.setState({loading: true});
        retrieveCDocUser(id)
            .then(res => {
                const data = res.data;
                this.setState({data: {'id': data.results.id, 'user': data.results.user.id, 'perm': data.results.perm}});
                this.form.setFieldsValue(data.results);
            }, error => {
                console.log(error.response);
            })
            .finally(() => this.setState({loading: false}));
    };

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

    handleUserPermissionOptions = () => {
        getCDocMemberPermissionTypes()
            .then(res => {
                const data = res.data;
                const perm_options = [];
                Object.keys(data.results).forEach(function(key) {
                    perm_options.push({'value': parseInt(key), 'label': data.results[key]});
                });
                this.setState({ member_perm_options: perm_options });
            }, error => {
                console.log(error.response);
            })
    }

    handleSubmit = (values) => {
        if (this.state.loading) return;
        const {isEdit} = this.props;
        const {id} = this.props;
        const {c_doc_id} = this.props;
        const successTip = isEdit ? '修改成功！' : '添加成功！';
        this.setState({loading: true});
        if (isEdit){
            updateCDocUser(id, values)
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
            let param = {
                ...values,
                'c_doc': c_doc_id
            }
            createCDocUser(param)
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
        const message =  (
            <div>
                <p>普通成员: 新建/修改/删除个人文档</p>
                <p>高级成员: 新建/修改文集内所有文档/删除个人文档</p>
                <p>文集管理员: 关于该文集的所有操作权限</p>
            </div>

        );
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
                        showSearch
                        type="select"
                        label="用户"
                        name="user"
                        required
                        options={this.state.user_options}
                    />
                    <FormElement
                        {...formProps}
                        type="select"
                        showSearch
                        label="权限"
                        name="perm"
                        required
                        options={this.state.member_perm_options}
                    />
                </Form>
                <Alert
                    message="Tips"
                    description={message}
                    type="success"
                    showIcon
                    closable
                />
            </ModalContent>
        );
    }
}

export default EditMemberUserModal;