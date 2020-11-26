import React, {Component} from 'react';
import {Button, Divider, Form, notification} from 'antd';
import FormElement from 'src/library/FormElement';
import config from 'src/utils/Hoc/configHoc';
import ModalContent from 'src/library/ModalHoc/ModalContent';
import {
    getCDocMemberPermissionTypes,
    getCDocUserList,
    updateCDocUser,
    deleteCDocUser,
    retrieveCDoc,
    updateCDoc,
} from 'src/apis/c_doc';
import {messageDuration} from "src/config/settings"
import Table from "src/library/Table"
import Operator from "src/library/Operator"
import EditMemberUserModal from './EditMemberUserModal'
// import EditMemberTeamModal from './EditTeamMemberModal'
import './style.less';


@config({
    modal: {
        title: '修改文集成员',
        maskClosable: true
    },
})
class EditMemberModal extends Component {
    state = {
        loading: false, // 页面加载loading
        memberPermissionTypes: {},  // 成员权限
        member_perm_options: [],           // 成员权限选项
        data: {},       // 回显数据
        userData: [],       // 用户成员
        teamData: [],       // 团队成员
        user_member_id: null,           // 修要修改的用户成员
        team_member_id: null,           // 修要修改的团队成员
        visibleUserMember: false,
        visibleTeamMember: false,
    };

    user_columns = [
        {
            title: '成员账号', dataIndex: 'user', sorter: true, width: 100,
            render: (value, record) => {
                return value.username;
            }
        },
        {
            title: '名称', dataIndex: 'user', sorter: true, width: 100,
            render: (value, record) => {
                return value.nickname;
            }
         },
        { title: '添加时间', dataIndex: 'created_time', sorter: true, width: 150 },
        { title: '权限', dataIndex: 'perm', sorter: true, width: 100, editable: true,
            render: (value, record) => {
                return (
                    <Form
                        ref={form => this.form = form}
                        initialValues={{'perm': value}}
                    >
                    <FormElement
                        showLabel={false}
                        label="权限"
                        type="select"
                        name="perm"
                        options={this.state.member_perm_options}
                        onChange={this.handleUpdateUserMember(record.id, value)}
                    />
                    </Form>
                );
            },
        },
        {
            title: '操作', dataIndex: 'operator', width: 100,
            render: (value, record) => {
                const items = [
                    {
                        label: '删除',
                        color: 'red',
                        confirm: {
                            title: `您确定删除"${record.user.nickname}"?`,
                            onConfirm: () => this.handleDeleteUserMember(record.id),
                        },
                    },
                ];
                return <Operator items={items}/>;
            },
        },
    ];

    team_columns = [
        { title: '团队名称', dataIndex: 'name', sorter: true, width: 100 },
        { title: '添加时间', dataIndex: 'created_time', sorter: true, width: 100 },
        {
            title: '操作', dataIndex: 'operator', width: 100,
            render: (value, record) => {
                const { id, name } = record;
                const items = [
                    {
                        label: '成员权限',
                        onClick: () => this.setState({ visible: true, id }),
                    },
                    {
                        label: '删除',
                        color: 'red',
                        confirm: {
                            title: `您确定删除"${name}"?`,
                            onConfirm: () => this.handleDelete(id),
                        },
                    },
                ];
                return <Operator items={items}/>;
            },
        },
    ];

    componentDidMount() {
        this.handleUserPermissionOptions();
        this.fetchData();
        this.fetchUserData();
    }


    fetchUserData = () => {
        if (this.state.loading) return;
        const {id} = this.props;
        this.setState({loading: true});
        getCDocUserList({'c_doc': id, 'not_page': true})
            .then(res => {
                const data = res.data;
                let results = data.results
                console.log('fetchUserData', results);
                this.setState({userData: results});
            }, error => {
                console.log(error.response);
            })
            .finally(() => this.setState({loading: false}));
    };

    handleUpdateUserMember  = (id) => (value) => {
        if (this.state.loading) return;
        this.setState({loading: true});
        updateCDocUser(id, {'perm': value}, 'patch')
            .then(res => {
                const data = res.data;
                notification.success({
                    message: '成功修改成员权限',
                    description: data.messages,
                    duration: messageDuration,
                });
            }, error => {
                console.log(error.response);
            })
            .finally(() => this.setState({loading: false}));

    };

    handleDeleteUserMember  = (id) => {
        if (this.state.deleting) return;
        this.setState({ deleting: true });
        deleteCDocUser(id)
            .then(res => {
                const data = res.data;
                notification.success({
                    message: '删除用户成员',
                    description: data.messages,
                    duration: messageDuration,
                });
                this.fetchUserData();
            }, error => {
                console.log(error.response);
            })
            .finally(() => this.setState({ deleting: false }));

    };

    handleUserPermissionOptions = () => {
        getCDocMemberPermissionTypes()
            .then(res => {
                const data = res.data;
                const perm_options = [];
                Object.keys(data.results).forEach(function(key) {
                    perm_options.push({'value': parseInt(key), 'label': data.results[key]});
                });
                this.setState({ memberPermissionTypes: data.results });
                this.setState({ member_perm_options: perm_options });
            }, error => {
                console.log(error.response);
            })
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
                this.form.setFieldsValue(results);
            }, error => {
                console.log(error.response);
            })
            .finally(() => this.setState({loading: false}));
    };



    handleSubmit = (values) => {
        if (this.state.loading) return;
        const {id} = this.props;
        const successTip = '修改文集权限成功！' ;
        this.setState({loading: true});
        if(values.perm === 40) {
            values.perm_value = values.access_code
            delete values.access_code
        }
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

    };

    render() {
        const {onCancel} = this.props;
        const {loading, data, userData, user_member_id, visibleUserMember } = this.state;
        const formProps = {
            labelWidth: 100,
        };
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
                    <FormElement layout>
                        <Button type="primary" styleName="form-button" onClick={() => this.setState({ visibleUserMember: true, user_member_id: null })}>添加用户</Button>
                        <Button type="primary" styleName="form-button">添加团队</Button>
                    </FormElement>
                </Form>

                <Table
                    loading={loading}
                    columns={this.user_columns}
                    dataSource={userData}
                    rowKey="id"
                    serialNumber={false}
                    showSorterTooltip={true}
                    // onChange={this.handleTableChange}
                />
                <Divider dashed />

                <Table
                    loading={loading}
                    columns={this.team_columns}
                    dataSource={data.teams}
                    rowKey="id"
                    serialNumber={false}
                    showSorterTooltip={true}
                    // onChange={this.handleTableChange}
                />
                <EditMemberUserModal
                    isEdit={user_member_id !== null}
                    visible={visibleUserMember}
                    id={user_member_id}
                    c_doc_id={data.id}
                    onOk={() => this.setState({ visibleUserMember: false }, () => this.fetchUserData())}
                    onCancel={() => this.setState({ visibleUserMember: false })}
                />
                {/*<EditMemberTeamModal*/}
                {/*    isEdit={user_member !== null}*/}
                {/*    visible={visibleUserMember}*/}
                {/*    user_member={user_member}*/}
                {/*    c_doc_id={data.id}*/}
                {/*    onOk={() => this.setState({ visibleUserMember: false }, () => this.fetchData())}*/}
                {/*    onCancel={() => this.setState({ visibleUserMember: false })}*/}
                {/*/>*/}
            </ModalContent>
        );
    }
}

export default EditMemberModal;