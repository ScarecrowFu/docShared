import React, {Component} from 'react';
import {Form, notification} from 'antd';
import FormElement from 'src/library/FormElement';
import config from 'src/utils/Hoc/configHoc';
import ModalContent from 'src/library/ModalHoc/ModalContent';
import {getCDocPermissionTypes, retrieveCDoc, updateCDoc} from 'src/apis/c_doc';
import {messageDuration} from "src/config/settings"
import {getUserList} from "src/apis/user"


@config({
    modal: {
        title: '修改文集权限',
        maskClosable: true
    },
})
class EditPermModal extends Component {
    state = {
        loading: false, // 页面加载loading
        data: {},       // 回显数据
        perm_options: [],           // 权限选项
        user_options: [],           // 用户选项
        current_perm: null,           // 当前权限
    };

    componentDidMount() {
        this.handlePermissionOptions();
        this.fetchData();
    }

    handlePermissionOptions = () => {
        getCDocPermissionTypes()
            .then(res => {
                const data = res.data;
                const perm_options = [];
                Object.keys(data.results).forEach(function(key) {
                    perm_options.push({'value': parseInt(key), 'label': data.results[key]});
                });
                this.setState({ perm_options: perm_options });
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
                results.creator = data.results.creator.nickname
                this.setState({data: results});
                this.setState({current_perm: results.perm});
                this.form.setFieldsValue(results);
                if(results.perm === 30) {
                    this.handleUserOptions();
                    let perm_value = results.perm_value.split(',');
                    perm_value = perm_value.map(numStr => parseInt(numStr));
                    this.form.setFieldsValue({'selected_users': perm_value});
                }
                if(results.perm === 40) {
                    this.form.setFieldsValue({'access_code': results.perm_value});
                }
            }, error => {
                console.log(error.response);
            })
            .finally(() => this.setState({loading: false}));
    };

    // todo 整理为分页获取选项
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

    handlePermChange = e => {
        this.setState({
            current_perm: e.target.value,
        });
        if (e.target.value === 30 && this.state.user_options.length === 0) {
            this.handleUserOptions()
        }
    }

    handleSubmit = (values) => {
        if (this.state.loading) return;
        const {id} = this.props;
        const successTip = '修改文集权限成功！' ;
        this.setState({loading: true});
        if(values.perm === 30) {
            values.perm_value = values.selected_users.join()
            delete values.selected_users
        }
        if(values.perm === 40) {
            values.perm_value = values.access_code
            delete values.access_code
        }
        console.log(values)
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
        const {loading, data } = this.state;
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
                        label="文集作者"
                        name="creator"
                        noSpace
                        disabled={true}
                    />
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
                    <FormElement
                        {...formProps}
                        type="radio-group"
                        label="权限选择"
                        name="perm"
                        noSpace
                        required
                        options={this.state.perm_options}
                        onChange={this.handlePermChange}
                    />
                    {this.state.current_perm === 30 ?
                        <FormElement
                            {...formProps}
                            type="select"
                            label="用户"
                            name="selected_users"
                            noSpace
                            required
                            mode="multiple"
                            options={this.state.user_options}
                        />
                        : null}

                    {this.state.current_perm === 40 ?
                        <FormElement
                            {...formProps}
                            label="访问码"
                            name="access_code"
                            noSpace
                            required
                            placeholder="访问码"
                        />
                        : null}

                </Form>
            </ModalContent>
        );
    }
}

export default EditPermModal;