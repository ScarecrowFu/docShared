import React, {Component} from 'react';
import {
    Button,
    notification,
    Tooltip,
    Divider,
    Form,
    Modal
} from 'antd';
import { ImportOutlined, PlusOutlined, HistoryOutlined } from '@ant-design/icons';
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
import ADDCDocModal from 'src/views/base/c_docs/EditModal'
import MarkdownEditor from 'src/components/MarkdownEditor'
import './style.less';
import FormRow from "src/library/FormRow"
import EditHistory from './EditHistory'


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
        HistoryVisible: false,  // 历史记录
        insertImageVisible: false,  // 插入图片
        addCDocVisible: false,  // 新增文集
        template_options: [],  // 模板选项
        tags_options: [],  // 标签选项
        c_doc_options: [],       // 文集数据
        doc_options: [],       // 上级文档
        status: 10, // 文档状态
        is_publish: false, // 是否发表
        content: '',  // 内容
    };

    handleCDocOptions = () => {
        getCDocList({'not_page': true, 'options': true})
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
        getDocList({'not_page': true, 'c_doc': value, 'tree': true, 'status': 20})
            .then(res => {
                const data = res.data;
                const doc_options = this.getDocOptions(data.results);
                this.setState({ doc_options: doc_options });

            }, error => {
                console.log(error.response);
            })
    };

    handleTemplateOptions = () => {
        getDocTemplateList({'not_page': true, 'options': true})
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
        getDocTagList({'not_page': true, 'options': true})
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
                    'c_doc': data.results.c_doc? data.results.c_doc.id: null,
                    'title': data.results.title,
                    'sort': data.results.sort,
                }
                if (data.results.c_doc){
                    this.handleCDocSelect(data.results.c_doc.id);
                }
                if (data.results.parent_doc) {
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
                console.log(data.results.status)
                if (data.results.status === 20) {
                    this.setState({is_publish: true});
                }

            }, error => {
                console.log(error.response);
            })
            .finally(() => this.setState({loading: false}));
    };


    componentDidMount() {
        const {isEdit, visibleType, c_doc_id} = this.props;
        this.handleCDocOptions();
        this.handleTemplateOptions();
        this.handleTagOptions();
        if (isEdit || visibleType === 'clone') {
            this.fetchData();
        }
        if (visibleType === 'add' && c_doc_id) {
            this.handleCreatedCDoc(c_doc_id)
        }
    }

    handleSubmit = async () => {
        if (this.state.loading) return;
        let values = await this.form.validateFields();
        values['parent_doc'] = values.parent_doc !== undefined? values.parent_doc: null;
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
        this.setState({ status: 10 }, function () {
            this.form.submit()
        });
    };

    handlePublicSubmit = () => {
        this.setState({ status: 20 }, function () {
            this.form.submit()
        });
    };

    handleContentChange = (values) => {
        this.setState({content: values});
    };



    render() {
        const {isEdit, onCancel, id, visibleType} = this.props;
        const {loading, doc_options, is_publish } = this.state;
        const formProps = {
            labelWidth: 80,
        };
        return (
            <ModalContent
                loading={loading}
                cancelText="关 闭"
                onCancel={onCancel}
                otherText1={!is_publish || visibleType === 'clone'? "草稿" : "撤回"}
                otherType1={!is_publish || visibleType === 'clone'? "primary" : "dashed"}
                otherButton1={() => this.handleDraftSubmit()}
                otherText2={!is_publish || visibleType === 'clone'? "发表" : "修改"}
                otherType2={!is_publish || visibleType === 'clone'? "primary" : "primary"}
                otherButton2={() => this.handlePublicSubmit()}
            >
                <Form
                    ref={form => this.form = form}
                    onFinish={this.handleSubmit}
                >
                    {isEdit ? <FormElement {...formProps} type="hidden" name="id"/> : null}
                    <FormRow>
                        <div style={{"marginLeft": "50px"}}>
                            <Tooltip title="导入模板">
                                <Button type="primary" shape="circle" icon={<ImportOutlined />} onClick={() => this.setState({ importTemplateVisible: true})} />
                            </Tooltip>
                            {isEdit ?
                                <Tooltip title="历史记录">
                                    <Button type="primary" shape="circle" icon={<HistoryOutlined/>}
                                            onClick={() => this.setState({HistoryVisible: true})}/>
                                </Tooltip>
                                :
                                null
                            }
                        </div>

                        <FormElement
                            {...formProps}
                            showSearch
                            type="select"
                            placeholder="选择文集"
                            label="文集"
                            name="c_doc"
                            options={this.state.c_doc_options}
                            required
                            dropdownRender={menu => (
                                <div>
                                    {menu}
                                    <Divider style={{ margin: '4px 0' }} />
                                    <div style={{ display: 'flex', flexWrap: 'nowrap', padding: 8 }}>
                                        <Button
                                            type="link"
                                            size="small"
                                            style={{ flex: 'none', padding: '8px', display: 'block', cursor: 'pointer' }}
                                            onClick={() => this.setState({ addCDocVisible: true})}
                                        >
                                            <PlusOutlined /> 新增文集
                                        </Button>
                                    </div>
                                </div>
                            )}
                            onSelect={this.handleCDocSelect}
                        />
                        <FormElement
                            {...formProps}
                            showSearch
                            type="select-tree"
                            placeholder="上级文档"
                            label="上级文档"
                            name="parent_doc"
                            dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                            allowClear
                            treeDefaultExpandAll
                            options={doc_options}
                        />
                        <FormElement
                            {...formProps}
                            showSearch
                            type="select"
                            placeholder="文档标签"
                            label="标签"
                            name="tags"
                            mode="tags"
                            options={this.state.tags_options}
                            onChange={this.handleTagsChange}
                            onDeselect={this.handleTagsDeselect}
                            onSelect={this.handleTagsSelect}
                        />
                        <FormElement
                            {...formProps}
                            type="number"
                            placeholder="文档排序值, 默认为99"
                            label="排序"
                            name="sort"
                        />
                    </FormRow>

                    <FormRow>
                        <FormElement
                            {...formProps}
                            label="标题"
                            name="title"
                            required
                            // noSpace
                        />
                    </FormRow>

                    <MarkdownEditor
                        content={this.state.content}
                        handleContentChange={this.handleContentChange}
                    />
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

                <EditHistory
                    visible={this.state.HistoryVisible}
                    id={id}
                    onOk={() => this.setState({ HistoryVisible: false })}
                    onCancel={() => this.setState({ HistoryVisible: false })}
                    width='60%'
                />
            </ModalContent>
        );
    }
}

export default EditModal;