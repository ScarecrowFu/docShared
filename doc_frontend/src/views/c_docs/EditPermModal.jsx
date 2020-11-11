import React, {Component} from 'react';
import {Form, notification} from 'antd';
import FormElement from 'src/library/FormElement';
import config from 'src/utils/Hoc/configHoc';
import ModalContent from 'src/library/ModalHoc/ModalContent';
import {createCDoc, getCDocPermissionTypes, retrieveCDoc, updateCDoc} from 'src/apis/c_doc';
import {messageDuration} from "../../config/settings"


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
                this.form.setFieldsValue(results);
            }, error => {
                console.log(error.response);
            })
            .finally(() => this.setState({loading: false}));
    };

    handlePermChange = e => {
        console.log('radio checked', e.target.value);
        this.setState({
            current_perm: e.target.value,
        });
    }

    handleSubmit = (values) => {
        if (this.state.loading) return;
        const {isEdit} = this.props;
        const {id} = this.props;
        const successTip = isEdit ? '修改成功！' : '添加成功！';
        this.setState({loading: true});
        if (isEdit){
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
        } else {
            createCDoc(values)
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
                            name="perm_value"
                            noSpace
                            required
                            options={this.state.user_options}
                        />
                        : null}

                    {this.state.current_perm === 40 ?
                        <FormElement
                            {...formProps}
                            label="访问码"
                            name="search"
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