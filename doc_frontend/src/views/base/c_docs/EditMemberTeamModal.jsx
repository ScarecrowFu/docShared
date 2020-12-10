import React, {Component} from 'react';
import {Alert, Divider, Form, notification} from 'antd';
import FormElement from 'src/library/FormElement';
import config from 'src/utils/Hoc/configHoc';
import ModalContent from 'src/library/ModalHoc/ModalContent';
import {
    retrieveCDocTeam,
    createCDocTeam,
    updateCDocTeam,
    getCDocMemberPermissionTypes,
} from 'src/apis/c_doc';
import {retrieveTeamGroup} from 'src/apis/team_group'
import {messageDuration} from "src/config/settings";
import {getTeamGroupList} from 'src/apis/team_group';
import Table from "../../../library/Table"


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
        membersData: [],       // 团队成员
        member_perm_options: [],           // 成员权限选项
        team_options: [],           // 团队权限选项
    };

    user_columns = [
        { title: '成员账号', dataIndex: 'username', width: 100 },
        { title: '名称', dataIndex: 'nickname', width: 100 },
        { title: '权限', dataIndex: 'perm', width: 100, editable: true,
            render: (value, record) => {
                const perm = value? value: 10
                return (
                    <Form
                        initialValues={{'perm': perm}}
                    >
                        <FormElement
                            showLabel={false}
                            label="权限"
                            type="select"
                            name="perm"
                            options={this.state.member_perm_options}
                            onChange={this.handleMembersData(record.id, value)}
                        />
                    </Form>
                );
            },
        }
    ];

    componentDidMount() {
        const {isEdit } = this.props;
        this.handleTeamOptions();
        this.handleUserPermissionOptions();
        if (isEdit) {
            this.fetchData();
        }
    }

    handleMembersData  = (id) => (value) => {
        const membersData = this.state.membersData;
        const index = membersData.findIndex(item => id === item.id);
        const item = this.state.membersData[index];
        membersData.splice(index, 1, {
            ...item,
            'perm': value,
        });
        this.setState({ membersData: membersData });
    };

    fetchData = () => {
        if (this.state.loading) return;
        const {id} = this.props;
        this.setState({loading: true});
        retrieveCDocTeam(id)
            .then(res => {
                const data = res.data;
                const membersData = res.data.results.members.map(item =>
                    ({ id: item.user.id,
                        username: item.user.username,
                        nickname: item.user.nickname,
                        perm: item.perm }));
                this.setState({data: {'id': data.results.id, 'team_group': data.results.team_group.id}});
                this.setState({membersData: membersData});
                this.form.setFieldsValue({'id': data.results.id, 'team_group': data.results.team_group.id});
            }, error => {
                console.log(error.response);
            })
            .finally(() => this.setState({loading: false}));
    };

    getTeamMember = (value) => {
        if (this.state.loading) return;
        const {isEdit} = this.props;
        this.setState({loading: true});
        if (isEdit) {
            this.fetchData();
        } else {
            retrieveTeamGroup(value)
                .then(res => {
                    const data = res.data;
                    const members = data.results.members;
                    const membersData = members.map(item => ({ id: item.id, username: item.username, nickname: item.nickname, perm: 10 }));
                    console.log(membersData);
                    this.setState({membersData: membersData});
                }, error => {
                    console.log(error.response);
                })
                .finally(() => this.setState({loading: false}));
        }

    };

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
        const {id} = this.props;
        const {c_doc_id} = this.props;
        const successTip = isEdit ? '修改成功！' : '添加成功！';
        this.setState({loading: true});
        if (isEdit){
            const membersData = this.state.membersData;
            let param = {
                ...values,
                'members': membersData,
                'c_doc': c_doc_id
            };
            updateCDocTeam(id, param)
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
            const membersData = this.state.membersData;
            let param = {
                ...values,
                'members': membersData,
                'c_doc': c_doc_id
            };
            createCDocTeam(param)
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
        let {data} = this.props;
        const {loading, membersData} = this.state;
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
                        label="团队"
                        name="team_group"
                        required
                        disabled={isEdit}
                        options={this.state.team_options}
                        onChange={this.getTeamMember}
                    />
                </Form>
                <Table
                    ref={table => this.table = table}
                    loading={loading}
                    columns={this.user_columns}
                    dataSource={membersData}
                    rowKey="id"
                    serialNumber={false}
                    showSorterTooltip={true}
                />
                <Divider dashed />
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