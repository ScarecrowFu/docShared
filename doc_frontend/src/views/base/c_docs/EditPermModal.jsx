import React, {Component} from 'react';
import {Form, notification, Alert} from 'antd';
import FormElement from 'src/library/FormElement';
import config from 'src/utils/Hoc/configHoc';
import ModalContent from 'src/library/ModalHoc/ModalContent';
import {getCDocPermissionTypes, retrieveCDoc, updateCDoc} from 'src/apis/c_doc';
import {messageDuration} from "src/config/settings"


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
                this.setState({data: results});
                this.setState({current_perm: results.perm});
                this.form.setFieldsValue(results);
            }, error => {
                console.log(error.response);
            })
            .finally(() => this.setState({loading: false}));
    };


    handlePermChange = e => {
        this.setState({
            current_perm: e.target.value,
        });
    }

    handleSubmit = (values) => {
        if (this.state.loading) return;
        const {id} = this.props;
        const successTip = '修改文集权限成功！' ;
        this.setState({loading: true});
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
        const message =  (
            <div>
                <p>公开: 所有人均可查看</p>
                <p>私密: 仅创建者可查看</p>
                <p>成员可见: 文集协作成员可查看, 具体成员可在 "成员" 中设置, 成员可设置用户与团队</p>
                <p>访问码可见: 使用正确的访问码可查看</p>
            </div>

        );
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
                    {this.state.current_perm === 20 ?
                        <FormElement
                            {...formProps}
                            label="访问码"
                            name="perm_value"
                            noSpace
                            required
                            placeholder="访问码"
                        />
                        : null}

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

export default EditPermModal;