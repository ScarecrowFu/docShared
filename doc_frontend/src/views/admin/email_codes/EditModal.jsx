import React, {Component} from 'react';
import {Form, notification} from 'antd';
import FormElement from 'src/library/FormElement';
import config from 'src/utils/Hoc/configHoc';
import ModalContent from 'src/library/ModalHoc/ModalContent';
import { createEmailCode, retrieveEmailCode, updateEmailCode, getVerificationTypes } from 'src/apis/email_code';
import {messageDuration} from "src/config/settings";
import validationRule from "../../../utils/validationRule";
import moment from "moment";


@config({
    modal: {
        title: props => props.isEdit ? '修改验证码' : '添加验证码',
        maskClosable: true
    },
})
class EditModal extends Component {
    state = {
        loading: false, // 页面加载loading
        data: {},       // 回显数据
        verification_types: null,           // 验证码类型
        status: 10
    };

    handleVerificationTypes = () => {
        getVerificationTypes()
            .then(res => {
                const data = res.data;
                this.setState({ verification_types: data.results });
            }, error => {
                console.log(error.response);
            })
    }

    componentDidMount() {
        const {isEdit} = this.props;
        this.handleVerificationTypes();
        if (isEdit) {
            this.fetchData();
        }
    }

    fetchData = () => {
        if (this.state.loading) return;
        const {id} = this.props;
        this.setState({loading: true});
        retrieveEmailCode(id)
            .then(res => {
                let data = res.data;
                data.results.expired_time = moment(data.results.expired_time)
                this.setState({data: data.results});
                this.setState({status: data.results.status});
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
            updateEmailCode(id, values)
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
            createEmailCode(values)
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
        const {loading, data, verification_types, status } = this.state;
        const formProps = {
            labelWidth: 100,
        };
        console.log('verification_types', verification_types);
        const types_options = [];
        if (verification_types) {
            Object.keys(verification_types).forEach(function(key) {
                types_options.push({'value': parseInt(key), 'label': verification_types[key]});
            });
        }
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
                        type="email"
                        label="电子邮箱"
                        name="email_name"
                        required
                        noSpace
                        disabled={status===0}
                        rules={[validationRule.email()]}
                    />

                    <FormElement
                        {...formProps}
                        type="select"
                        label="验证码类型"
                        name="verification_type"
                        required
                        noSpace
                        options={types_options}
                        disabled={status===0}
                    />
                    <FormElement
                        {...formProps}
                        label="验证码"
                        name="verification_code"
                        required
                        noSpace
                        disabled={status===0}
                    />

                    <FormElement
                        {...formProps}
                        type="date-time"
                        label="过期时间"
                        name="expired_time"
                        required
                        format="YYYY-MM-DD HH:mm:ss"
                        disabled={status===0}
                    />
                </Form>
            </ModalContent>
        );
    }
}

export default EditModal;