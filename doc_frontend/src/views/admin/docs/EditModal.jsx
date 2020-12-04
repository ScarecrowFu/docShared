import React, {Component} from 'react';
import MDEditor, { commands, ICommand, TextState, TextApi } from '@uiw/react-md-editor';
import {
    Button,
    notification,
    Tooltip,
    Menu,
    Select,
    Divider,
    Typography,
    TreeSelect,
    InputNumber,
    Form,
    Modal
} from 'antd';
import { ImportOutlined, PlusOutlined } from '@ant-design/icons';
import FormElement from 'src/library/FormElement';
import config from 'src/utils/Hoc/configHoc';
import ModalContent from 'src/library/ModalHoc/ModalContent';
import {
    createDoc,
    getDocTemplateList,
    retrieveDoc,
    retrieveDocTemplate,
    updateDoc,
    getDocTagList,
    getDocList} from 'src/apis/doc';
import { getCDocList } from 'src/apis/c_doc';
import {messageDuration} from "src/config/settings"
import ADDCDocModal from 'src/views/admin/c_docs/EditModal'
import ImageModal from './ImageModal'
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
        importTemplateVisible: false,  // 导入模板
        insertImageVisible: false,  // 插入图片
        addCDocVisible: false,  // 新增文集
        template_options: [],  // 模板选项
        tags_options: [],  // 标签选项
        c_doc_options: [],       // 文集数据
        doc_options: [],       // 上级文档
        status: 10, // 文档状态
        content: '',  // 内容
    };

    handleCDocOptions = () => {
        getCDocList({'not_page': true})
            .then(res => {
                const data = res.data;
                const c_doc_options = [];
                data.results.forEach(function (item) {
                    c_doc_options.push({'value': item.id, 'label': item.name})
                });
                this.setState({ c_doc_options: c_doc_options });

            }, error => {
                console.log(error.response);
            })
    };

    handleCreatedCDoc = (id) => {
        this.form.setFieldsValue({'c_doc': id});
    };

    getDocOptions = (doc_data) => {
        let doc_options = []
        const _that = this;
        doc_data.forEach(function (item) {
            let doc = {'label': item.title, 'value': item.id, 'children': []};
            const child_docs = item.child_docs;
            if (child_docs.length > 0) {
                doc['children'] = _that.getDocOptions(child_docs);
            }
            doc_options.push(doc)
        })
        return doc_options
    };

    handleCDocSelect = (value) => {
        getDocList({'not_page': true, 'c_doc': value, 'tree': true})
            .then(res => {
                const data = res.data;
                const doc_options = this.getDocOptions(data.results);
                console.log('doc_options', doc_options);
                this.setState({ doc_options: doc_options });

            }, error => {
                console.log(error.response);
            })
    };

    handleTemplateOptions = () => {
        getDocTemplateList({'not_page': true})
            .then(res => {
                const data = res.data;
                const template_options = [];
                data.results.forEach(function (item) {
                    template_options.push({'value': item.id, 'label': item.name})
                });
                this.setState({ template_options: template_options });
            }, error => {
                console.log(error.response);
            })
    };

    handleTemplateOptionOk =  async () => {
        const values = await  this.templateForm.validateFields();
        this.setState({loading: true});
        retrieveDocTemplate(values.template)
            .then(res => {
                const data = res.data;
                this.setState({content: data.results.content});
            }, error => {
                console.log(error.response);
            })
            .finally(() => this.setState({loading: false}));
        this.setState({importTemplateVisible: false});
    };

    handleTagOptions = () => {
        getDocTagList({'not_page': true})
            .then(res => {
                const data = res.data;
                const tags_options = [];
                data.results.forEach(function (item) {
                    tags_options.push({'value': item.name, 'label': item.name})
                });
                this.setState({ tags_options: tags_options });
            }, error => {
                console.log(error.response);
            })
    };

    handleTagsChange = (value) => {
        console.log('handleTagsChange', value);
    };

    handleTagsDeselect = (value) => {
        console.log('handleTagsDeselect', value);
    };

    handleTagsSelect = (value) => {
        console.log('handleTagsSelect', value);
    };


    fetchData = () => {
        if (this.state.loading) return;
        const {id} = this.props;
        this.setState({loading: true});
        retrieveDoc(id)
            .then(res => {
                const data = res.data;
                this.setState({data: data.results});
                let formData = {
                    'id': data.results.id,
                    'c_doc': data.results.c_doc.id,
                    'title': data.results.title,
                    'sort': data.results.sort,
                }
                if (data.results.parent_doc) {
                    this.handleCDocSelect(data.results.c_doc.id);
                    formData.parent_doc = data.results.parent_doc.id;
                }
                if (data.results.tags) {
                    let tags = [];
                    data.results.tags.forEach(function (item) {
                        tags.push(item.name);
                    })
                    formData.tags = tags;
                }
                this.form.setFieldsValue(formData);
                this.setState({content: data.results.content});
                this.setState({status: data.results.status});
            }, error => {
                console.log(error.response);
            })
            .finally(() => this.setState({loading: false}));
    };


    componentDidMount() {
        const {isEdit} = this.props;
        this.handleCDocOptions();
        this.handleTemplateOptions();
        this.handleTagOptions();
        if (isEdit) {
            this.fetchData();
        }
    }

    handleSubmit = async () => {
        if (this.state.loading) return;
        const values = await this.form.validateFields();
        console.log('doc_status', this.state.status);
        console.log('values', values);
        const {isEdit} = this.props;
        const {id} = this.props;
        const successTip = isEdit ? '修改成功！' : '添加成功！';
        this.setState({loading: true});
        let params = {
            ...values,
            content: this.state.content,
            status: this.state.status
        }
        if (isEdit){
            updateDoc(id, params)
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
            createDoc(params)
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

    handleDraftSubmit = () => {
        console.log('handleDraftSubmit');
        this.setState({ status: 10 });
    };

    handlePublicSubmit = () => {
        console.log('handlePublicSubmit');
        this.setState({ status: 20 });
    };

    handleContentChange = (values) => {
        this.setState({content: values});
    };



    render() {
        const {isEdit, onCancel} = this.props;
        const {loading, doc_options } = this.state;
        const formProps = {
            labelWidth: 80,
        };
        // todo 增加 插入图片与插入附件功能
        const insertImages: ICommand = {
            name: '插入图片',
            keyCommand: 'insertImages',
            buttonProps: { 'aria-label': 'Insert title3' },
            icon: (
                <svg width="12" height="12" viewBox="0 0 20 20">
                    <path fill="currentColor" d="M15 9c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm4-7H1c-.55 0-1 .45-1 1v14c0 .55.45 1 1 1h18c.55 0 1-.45 1-1V3c0-.55-.45-1-1-1zm-1 13l-6-5-2 2-4-5-4 8V4h16v11z" />
                </svg>
            ),
            execute: (state: TextState, api: TextApi) => {
                // let modifyText = `### ${state.selectedText}\n`;
                // if (!state.selectedText) {
                //     modifyText = `### `;
                // }
                // api.replaceSelection(modifyText);
                this.setState({insertImageVisible: true});
            },
        };

        const { Text } = Typography;
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
                <Form
                    ref={form => this.form = form}
                    onFinish={this.handleSubmit}
                >
                    {isEdit ? <FormElement {...formProps} type="hidden" name="id"/> : null}
                    <div styleName="flex-container">
                        <div styleName="flex-item-left">
                            <div styleName='flex-item'>
                                <Text type="secondary">导入模板:</Text>
                            </div>
                            <Tooltip title="导入模板">
                                <Button type="primary" shape="circle" icon={<ImportOutlined />} onClick={() => this.setState({ importTemplateVisible: true})} />
                            </Tooltip>
                            <Divider dashed />

                            <div styleName='flex-item'>
                                <Text type="secondary"><span style={{ color: 'red' }}>*</span>选择文集:</Text>
                            </div>
                            <FormElement
                                showSearch
                                type="select"
                                styleName='flex-item'
                                placeholder="选择文集"
                                label="文集"
                                showLabel={false}
                                name="c_doc"
                                options={this.state.c_doc_options}
                                required
                                width={'90%'}
                                dropdownRender={menu => (
                                    <div>
                                        {menu}
                                        <Divider style={{ margin: '4px 0' }} />
                                        <div style={{ display: 'flex', flexWrap: 'nowrap', padding: 8 }}>
                                            <a
                                                style={{ flex: 'none', padding: '8px', display: 'block', cursor: 'pointer' }}
                                                onClick={() => this.setState({ addCDocVisible: true})}

                                            >
                                                <PlusOutlined /> 新增文集
                                            </a>
                                        </div>
                                    </div>
                                )}
                                onSelect={this.handleCDocSelect}
                            />
                            {/*<Divider dashed />*/}

                            <div styleName='flex-item'>
                                <Text type="secondary">上级文档:</Text>
                            </div>
                            <FormElement
                                showSearch
                                type="select-tree"
                                styleName='flex-item'
                                placeholder="上级文档"
                                label="上级文档"
                                showLabel={false}
                                name="parent_doc"
                                dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                                allowClear
                                treeDefaultExpandAll
                                options={doc_options}
                            />

                            <div styleName='flex-item'>
                                <Text type="secondary">文档标签:</Text>
                            </div>
                            <FormElement
                                showSearch
                                type="select"
                                styleName='flex-item'
                                placeholder="文档标签"
                                name="tags"
                                mode="tags"
                                width={'90%'}
                                options={this.state.tags_options}
                                onChange={this.handleTagsChange}
                                onDeselect={this.handleTagsDeselect}
                                onSelect={this.handleTagsSelect}
                            />
                            {/*<Divider dashed />*/}

                            <div styleName='flex-item'>
                                <Text type="secondary">文档排序:</Text>
                            </div>
                            <FormElement
                                type="number"
                                styleName='flex-item'
                                placeholder="文档排序值, 默认为99"
                                name="sort"
                                width={'90%'}
                            />
                            <Divider dashed />
                            {isEdit ?
                                (this.state.status === 10
                                        ? <Button styleName="form-button" htmlType="submit" onClick={this.handleDraftSubmit}>保存</Button>
                                        : null
                                )
                                :
                                <Button styleName="form-button" htmlType="submit" onClick={this.handleDraftSubmit}>保存</Button>
                            }
                            {isEdit?
                                (this.state.status === 20
                                        ? <Button styleName="form-button" htmlType="submit"  type="primary" onClick={this.handlePublicSubmit}>修改</Button>
                                        : <Button styleName="form-button" htmlType="submit"  type="primary" onClick={this.handlePublicSubmit}>发表</Button>
                                )
                                :
                                <Button styleName="form-button" htmlType="submit"  type="primary" onClick={this.handlePublicSubmit}>发表</Button>
                            }


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
                                value={this.state.content}
                                height={650}
                                commands={[
                                    commands.bold, commands.italic, commands.strikethrough, commands.hr, commands.title,
                                    commands.divider, commands.link, commands.quote, commands.code, commands.image,
                                    commands.unorderedListCommand, commands.orderedListCommand, commands.checkedListCommand,
                                    commands.codeEdit, commands.codeLive, commands.codePreview, commands.fullscreen,
                                    // Custom Toolbars here
                                    insertImages,

                                ]}
                                onChange={this.handleContentChange}
                            />
                        </div>
                    </div>
                </Form>

                <Modal
                    title="选择文档模板"
                    visible={this.state.importTemplateVisible}
                    onOk={this.handleTemplateOptionOk}
                    onCancel={() => this.setState({ importTemplateVisible: false})}
                >
                    <Form
                        ref={templateForm => this.templateForm = templateForm}
                    >
                        <FormElement
                            {...formProps}
                            type="select"
                            label="文档模板"
                            name="template"
                            required
                            options={this.state.template_options}
                        />
                    </Form>
                </Modal>

                <ADDCDocModal
                    visible={this.state.addCDocVisible}
                    isEdit={false}
                    handleCreatedCDoc={this.handleCreatedCDoc}
                    onOk={() => this.setState({ addCDocVisible: false }, () => this.handleCDocOptions())}
                    onCancel={() => this.setState({ addCDocVisible: false })}
                    width='60%'
                />

                <ImageModal
                    visible={this.state.insertImageVisible}
                    onOk={() => this.setState({ insertImageVisible: false })}
                    onCancel={() => this.setState({ insertImageVisible: false })}
                />

            </ModalContent>
        );
    }
}

export default EditModal;