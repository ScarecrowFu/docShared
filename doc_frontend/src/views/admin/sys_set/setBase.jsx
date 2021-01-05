import React, {Component} from 'react';
import {Button, Form, Input, InputNumber, notification, Switch} from 'antd';
import PageContent from "src/layouts/PageContent"
import './style.less'
import {getSystemSettingSpecifyList, saveSystemSettingSpecifyList} from 'src/apis/sys_set'
import {InfoCircleOutlined} from '@ant-design/icons';
import {messageDuration} from "src/config/settings"
import PropTypes from "prop-types"


export default class SetBase extends Component {
    static propTypes = {
        set_classify: PropTypes.string,
    };

    static defaultProps = {
        set_classify: 'WebsiteSet',
    };

    state = {
        loading: false,
        dataSource: [],     // 表格数据
    };

    getSetList = () => {
        console.log('getSetList', this.props.set_classify);
        getSystemSettingSpecifyList({'set_classify': this.props.set_classify})
            .then(res => {
                const data = res.data;
                this.setState({ dataSource: data.results });
            }, error => {
                console.log(error.response);
            })
    }

    saveSetList = (values) => {
        if (this.state.loading) return;
        console.log(this,this.form);
        console.log(values);
        this.setState({loading: true});
        saveSystemSettingSpecifyList({'settings': values})
            .then(res => {
                const data = res.data;
                this.getSetList();
                notification.success({
                    message: '修改成功！',
                    description: data.messages,
                    duration: messageDuration,
                });
            }, error => {
                console.log(error.response);
            })
            .finally(() => this.setState({loading: false}));
    }

    renderInput(item) {
        const { TextArea } = Input;
        if (item.set_type === 10) {
            return <Input name={item.key} placeholder={item.description} />;
        } else if (item.set_type === 20) {
            return <TextArea name={item.key} placeholder={item.description}  rows={4} />;
        } else if (item.set_type === 30) {
            return <InputNumber name={item.key} placeholder={item.description}  precision="0.1" />;
        } else if (item.set_type === 40) {
            return <InputNumber name={item.key} placeholder={item.description}/>;
        } else if (item.set_type === 60) {
            return  <Switch name={item.key} defaultChecked={item.value}/>;
        } else {
            return <Input name={item.key} placeholder={item.description} />;
        }

    }

    componentDidMount() {
        this.getSetList();
    }

    render() {
        const listItems = this.state.dataSource.map((item) =>
            <Form.Item
                key={item.key}
                name={item.key}
                styleName="formItem"
                label={item.name}
                initialValue={item.value}
                tooltip={{ title: item.description, icon: <InfoCircleOutlined /> }}
            >
                {this.renderInput(item)}
            </Form.Item>
        );

        return (
            <PageContent>
                <Form
                    ref={form => this.form = form}
                    layout="vertical"
                    name="sys_set"
                    onFinish={this.saveSetList}
                >
                    {listItems}
                    <Form.Item styleName="formItem">
                        <Button
                            type="primary"
                            htmlType="submit"
                        >保 存</Button>
                    </Form.Item>
                </Form>
            </PageContent>

        );
    }
}