import React, {Component} from 'react';
import {Form, notification} from 'antd';
import FormElement from 'src/library/FormElement';
import config from 'src/utils/Hoc/configHoc';
import ModalContent from 'src/library/ModalHoc/ModalContent';
import { createRegisterCode, retrieveRegisterCode, updateRegisterCode } from 'src/apis/reg_code';
import {messageDuration} from "src/config/settings";
import validationRule from 'src/utils/validationRule'
import Table from "src/library/Table"
import Pagination from "src/library/Pagination"
import {getUserList} from "src/apis/user"


@config({
    modal: {
        title: props => props.isEdit ? '修改注册邀请码' : '添加注册邀请码',
        maskClosable: true
    },
})
class EditModal extends Component {
    state = {
        loading: false, // 页面加载loading
        data: {},       // 回显数据
        total: 0,           // 分页中条数
        pageNum: 1,         // 分页当前页
        pageSize: 10,       // 分页每页显示条数
        ordering: null,
        userData: []
    };

    componentDidMount() {
        const {isEdit} = this.props;
        if (isEdit) {
            this.fetchData();
            this.handleUserTable();
        }
    }

    fetchData = () => {
        if (this.state.loading) return;
        const {id} = this.props;
        this.setState({loading: true});
        retrieveRegisterCode(id)
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
        if (isEdit){
            updateRegisterCode(id, values)
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
            createRegisterCode(values)
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

    columns = [
        { title: '账号', dataIndex: 'username', width: 200 },
        { title: '名称', dataIndex: 'nickname',  width: 200 },
        { title: '邮箱', dataIndex: 'email', width: 200 },
        { title: '性别', dataIndex: 'gender',  width: 100 },
    ];

    handleUserTable = () => {
        if (this.state.loading) return;

        let params = {
            page: this.state.pageNum,
            page_size: this.state.pageSize,
            register_code: this.props.id
        };
        if (this.state.ordering) {
            params['ordering'] = this.state.ordering;
        }

        this.setState({ loading: true });
        getUserList(params)
            .then(res => {
                const data = res.data;
                const userData = data?.results || [];
                const total = data?.all_count || 0;
                this.setState({ userData, total });
            }, error => {
                console.log(error.response);
            })
            .finally(() => this.setState({ loading: false }));
    };

    render() {
        const {isEdit, onCancel} = this.props;
        const {loading, data, userData, total, pageNum, pageSize } = this.state;
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
                        type="number"
                        label="有效注册数量"
                        name="all_cnt"
                        required
                        noSpace
                        rules={[validationRule.integer()]}
                    />
                </Form>
                {isEdit?
                 <div>
                     <Table
                         loading={loading}
                         columns={this.columns}
                         dataSource={userData}
                         rowKey="id"
                         serialNumber={false}
                         pageNum={pageNum}
                         pageSize={pageSize}
                     />

                     <Pagination
                         total={total}
                         pageNum={pageNum}
                         pageSize={pageSize}
                         onPageNumChange={pageNum => this.setState({ pageNum }, () => this.handleSubmit())}
                         onPageSizeChange={pageSize => this.setState({ pageSize, pageNum: 1 })}
                     />
                 </div> :
                null
                }


            </ModalContent>
        );
    }
}

export default EditModal;