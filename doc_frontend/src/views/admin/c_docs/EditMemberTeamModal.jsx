import React, {Component} from 'react';
import {Alert, Form, notification} from 'antd';
import FormElement from 'src/library/FormElement';
import config from 'src/utils/Hoc/configHoc';
import ModalContent from 'src/library/ModalHoc/ModalContent';
import { updateCDocMembers, getCDocMemberPermissionTypes } from 'src/apis/c_doc';
import {messageDuration} from "src/config/settings";
import {getTeamGroupList} from 'src/apis/team_group';

@config({
    modal: {
        title: props => props.isEdit ? '修改团队权限' : '添加团队',
        maskClosable: true
    },
})
class EditMemberTeamModal extends Component {
    state = {
        loading: false, // 页面加载loading
        data: {},       // 回显数据
        member_perm_options: [],           // 成员权限选项
        team_options: [],           // 团队权限选项
        team_members: [],           // 团队成员
    };

    componentDidMount() {
        const {isEdit, team_member } = this.props;
        this.handleTeamOptions();
        this.handleUserPermissionOptions();
        // if (isEdit) {
        //     this.setState({ data: {'id': user_member.id, 'user': user_member.user.id, 'perm': user_member.perm}});
        // }
    }

    handleTeamOptions = () => {
        getTeamGroupList({'not_page': true})
            .then(res => {
                const data = res.data;
                const team_options = [];
                data.results.forEach(function (item) {
                    team_options.push({'value': item.id, 'label': item.name})
                })
                this.setState({ team_options: team_options });
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
                console.log(perm_options);
                this.setState({ member_perm_options: perm_options });
            }, error => {
                console.log(error.response);
            })
    }

    handleSubmit = (values) => {
        if (this.state.loading) return;
        const {isEdit} = this.props;
        const {c_doc_id} = this.props;
        const successTip = isEdit ? '修改成功！' : '添加成功！';
        let params = {
            'team': values,
            members_type: 'team',
        };
        this.setState({loading: true});
        updateCDocMembers(c_doc_id, params)
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
        const {isEdit, onCancel, team_member} = this.props;
        let {data} = this.props;
        const {loading} = this.state;
        // if (isEdit) {
        //     data = {'id': user_member.id, 'user': user_member.user.id, 'perm': user_member.perm};
        // }
        const formProps = {
            labelWidth: 100,
        };
        const message =  (
            <div>
                <p>普通成员: 新建/修改/删除个人文档</p>
                <p>高级成员: 新建/修改文集内所有文档/删除个人文档</p>
                <p>文集管理员: 新建/修改/删除文集文档+文集配置管理</p>
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
                        type="select"
                        label="团队"
                        name="user"
                        required
                        options={this.state.team_options}
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

export default EditMemberTeamModal;