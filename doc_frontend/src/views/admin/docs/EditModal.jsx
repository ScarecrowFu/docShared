import React, {Component} from 'react';
import MDEditor, { commands, ICommand, TextState, TextApi } from '@uiw/react-md-editor';
import {Button, notification, Tooltip, Menu, Select, Divider, Typography, TreeSelect, InputNumber  } from 'antd';
import { ImportOutlined, PlusOutlined } from '@ant-design/icons';
import FormElement from 'src/library/FormElement';
import config from 'src/utils/Hoc/configHoc';
import ModalContent from 'src/library/ModalHoc/ModalContent';
import { createDoc, retrieveDoc, updateDoc } from 'src/apis/doc';
import { getCDocList } from 'src/apis/c_doc';
import {messageDuration} from "src/config/settings"
import './style.less';


@config({
    modal: {
        title: props => props.isEdit ? '修改文档' : '添加文档',
        maskClosable: true
    },
})
class EditModal extends Component {
    state = {
        loading: false, // 页面加载loading
        data: {},       // 回显数据
        c_doc_options: [],       // 文集数据
    };

    componentDidMount() {
        const {isEdit} = this.props;
        this.handleCDocOptions();
        if (isEdit) {
            this.fetchData();
        }
    }

    fetchData = () => {
        if (this.state.loading) return;
        const {id} = this.props;
        this.setState({loading: true});
        retrieveDoc(id)
            .then(res => {
                const data = res.data;
                this.setState({data: data.results});
                this.form.setFieldsValue(data.results);
            }, error => {
                console.log(error.response);
            })
            .finally(() => this.setState({loading: false}));
    };

    // todo 整理为分页获取选项
    handleCDocOptions = () => {
        getCDocList({'not_page': true})
            .then(res => {
                const data = res.data;
                const c_doc_options = [];
                data.results.forEach(function (item) {
                    c_doc_options.push({'value': item.id, 'label': item.name})
                })
                this.setState({ c_doc_options: c_doc_options });
            }, error => {
                console.log(error.response);
            })
    }

    handleSubmit = (values) => {
        if (this.state.loading) return;
        const {isEdit} = this.props;
        const {id} = this.props;
        const successTip = isEdit ? '修改成功！' : '添加成功！';
        this.setState({loading: true});
        if (isEdit){
            updateDoc(id, values)
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
            createDoc(values)
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
        const {loading } = this.state;
        const formProps = {
            labelWidth: 100,
        };

        const title3: ICommand = {
            name: 'title3',
            keyCommand: 'title3',
            buttonProps: { 'aria-label': 'Insert title3' },
            icon: (
                <svg width="12" height="12" viewBox="0 0 520 520">
                    <path fill="currentColor" d="M15.7083333,468 C7.03242448,468 0,462.030833 0,454.666667 L0,421.333333 C0,413.969167 7.03242448,408 15.7083333,408 L361.291667,408 C369.967576,408 377,413.969167 377,421.333333 L377,454.666667 C377,462.030833 369.967576,468 361.291667,468 L15.7083333,468 Z M21.6666667,366 C9.69989583,366 0,359.831861 0,352.222222 L0,317.777778 C0,310.168139 9.69989583,304 21.6666667,304 L498.333333,304 C510.300104,304 520,310.168139 520,317.777778 L520,352.222222 C520,359.831861 510.300104,366 498.333333,366 L21.6666667,366 Z M136.835938,64 L136.835937,126 L107.25,126 L107.25,251 L40.75,251 L40.75,126 L-5.68434189e-14,126 L-5.68434189e-14,64 L136.835938,64 Z M212,64 L212,251 L161.648438,251 L161.648438,64 L212,64 Z M378,64 L378,126 L343.25,126 L343.25,251 L281.75,251 L281.75,126 L238,126 L238,64 L378,64 Z M449.047619,189.550781 L520,189.550781 L520,251 L405,251 L405,64 L449.047619,64 L449.047619,189.550781 Z" />
                </svg>
            ),
            execute: (state: TextState, api: TextApi) => {
                let modifyText = `### ${state.selectedText}\n`;
                if (!state.selectedText) {
                    modifyText = `### `;
                }
                api.replaceSelection(modifyText);
            },
        };

        const { Text } = Typography;
        const { TreeNode } = TreeSelect;


        return (
            <ModalContent
                loading={loading}
                // okText={isEdit ? "修改" : "保存"}
                cancelText="关 闭"
                // resetText={isEdit ? null : "重置"}
                // onOk={() => this.form.submit()}
                onCancel={onCancel}
                // onReset={isEdit ? null : () => this.form.resetFields()}
            >
                <div styleName="flex-container">
                    <div styleName="flex-item-left">
                        <Menu
                            inlineCollapsed={false}>
                            <div styleName='flex-item'>
                                <Text type="secondary">导入模板:</Text>
                            </div>
                            <Tooltip title="导入模板">
                                <Button type="primary" shape="circle" icon={<ImportOutlined />} />
                            </Tooltip>
                            <Divider dashed />
                            <div styleName='flex-item'>
                                <Text type="secondary">选择文集:</Text>
                            </div>
                            <Select
                                styleName='flex-item'
                                placeholder="选择文集"
                                options={this.state.c_doc_options}
                                dropdownRender={menu => (
                                    <div>
                                        {menu}
                                        <Divider style={{ margin: '4px 0' }} />
                                        <div style={{ display: 'flex', flexWrap: 'nowrap', padding: 8 }}>
                                            <a
                                                style={{ flex: 'none', padding: '8px', display: 'block', cursor: 'pointer' }}

                                            >
                                                <PlusOutlined /> 新增文集
                                            </a>
                                        </div>
                                    </div>
                                )}
                            >
                            </Select>
                            <Divider dashed />
                            <div styleName='flex-item'>
                                <Text type="secondary">上级文档:</Text>
                            </div>
                            <TreeSelect
                                showSearch
                                styleName='flex-item'
                                value={this.state.value}
                                dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                                placeholder="Please select"
                                allowClear
                                treeDefaultExpandAll
                                onChange={this.onChange}
                            >
                                <TreeNode value="parent 1" title="parent 1">
                                    <TreeNode value="parent 1-0" title="parent 1-0">
                                        <TreeNode value="leaf1" title="my leaf" />
                                        <TreeNode value="leaf2" title="your leaf" />
                                    </TreeNode>
                                    <TreeNode value="parent 1-1" title="parent 1-1">
                                        <TreeNode value="sss" title={<b style={{ color: '#08c' }}>sss</b>} />
                                    </TreeNode>
                                </TreeNode>
                            </TreeSelect>
                            <Divider dashed />
                            <div styleName='flex-item'>
                                <Text type="secondary">文档标签:</Text>
                            </div>
                            <div styleName='flex-item'>
                                <Select  mode="tags" style={{ width: '100%' }} placeholder="Tags Mode">
                                </Select>
                            </div>
                            <Divider dashed />
                            <div styleName='flex-item'>
                                <Text type="secondary">文档排序:</Text>
                            </div>
                            <InputNumber styleName='flex-item' placeholder="文档排序值, 默认为99"/>
                            <Divider dashed />
                            <Button styleName="form-button" onClick={() => this.setState({ visible: true, id: null })}>保存</Button>
                            <Button styleName="form-button" type="primary" onClick={() => this.setState({ visible: true, id: null })}>发表</Button>
                        </Menu>

                    </div>
                    <div styleName="flex-item-right">
                        <FormElement
                            {...formProps}
                            label="标题"
                            name="title"
                            required
                            noSpace
                        />
                        <MDEditor
                            value="Hello Markdown!"
                            height={650}
                            commands={[
                                commands.bold, commands.italic, commands.strikethrough, commands.hr, commands.title,
                                commands.divider, commands.link, commands.quote, commands.code, commands.image,
                                commands.unorderedListCommand, commands.orderedListCommand, commands.checkedListCommand,
                                commands.codeEdit, commands.codeLive, commands.codePreview, commands.fullscreen,
                                // Custom Toolbars
                                title3,
                            ]}
                        />
                    </div>
                </div>
            </ModalContent>
        );
    }
}

export default EditModal;