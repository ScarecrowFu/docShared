import React, {Component} from 'react';
import {Form} from 'antd';
import config from 'src/utils/Hoc/configHoc';
import FormElement from 'src/library/FormElement';


@config({
    path: '/admin/setting/website_set',
    title: {text: '站点信息', icon: 'setting'},
    breadcrumbs: [{key: 'website_set', text: '站点信息', icon: 'setting'}],
})
class SysSet extends Component {
    state = {
        loading: false,     // 表格加载数据loading
        dataSource: [],     // 表格数据
        selectedRowKeys: [],// 表格中选中行keys
        total: 0,           // 分页中条数
        pageNum: 1,         // 分页当前页
        pageSize: 10,       // 分页每页显示条数
        deleting: false,    // 批量删除中loading
        visible: false,     // 添加、修改弹框
        id: null,           // 需要修改的数据id
        ordering: null,           // 排序
        user_options: [],           // 用户选项
    };

    componentDidMount() {
    }

    render() {
        const {
            data,
        } = this.state;

        const formProps = {
            width: 200,
        };
        return (
            <Form
                ref={form => this.form = form}
                onFinish={this.handleSubmit}
                initialValues={data}
            >
                <FormElement
                    {...formProps}
                    label="名称"
                    name="name"
                    required
                    noSpace
                />
            </Form>
        );
    }
}

export default SysSet;