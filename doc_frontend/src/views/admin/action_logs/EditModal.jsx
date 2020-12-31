import React, {Component} from 'react';
import { Descriptions, Badge } from 'antd';
import config from 'src/utils/Hoc/configHoc';
import ModalContent from 'src/library/ModalHoc/ModalContent';
import {getActionTypes, retrieveActionLog} from 'src/apis/action_log';


@config({
    modal: {
        title: '操作日志详情',
        maskClosable: true
    },
})
class EditModal extends Component {
    state = {
        loading: false, // 页面加载loading
        data: {},       // 回显数据
        action_types: {},           // 操作类型
    };

    handleActionTypes = () => {
        getActionTypes()
            .then(res => {
                const data = res.data;
                this.setState({ action_types: data.results });
            }, error => {
                console.log(error.response);
            })
    }

    componentDidMount() {
        this.handleActionTypes();
        this.fetchData();
    }

    fetchData = () => {
        if (this.state.loading) return;
        const {id} = this.props;
        this.setState({loading: true});
        retrieveActionLog(id)
            .then(res => {
                const data = res.data;
                this.setState({data: data.results});
            }, error => {
                console.log(error.response);
            })
            .finally(() => this.setState({loading: false}));
    };

    render() {
        const {onCancel} = this.props;
        const {loading, data, action_types } = this.state;
        const {user, content_object, action_type, action_info, remote_ip, created_time} = data
        return (
            <ModalContent
                loading={loading}
                cancelText="取消"
                onCancel={onCancel}
            >
                <Descriptions title="Action Log Info" bordered>
                    <Descriptions.Item label="用户">{user ? user.nickname : '-'}</Descriptions.Item>
                    <Descriptions.Item label="操作对象"  span={2}>{content_object ? content_object.model + '-' + content_object.name : '-'}</Descriptions.Item>
                    {/*<Descriptions.Item label="操作类型">{action_types[action_type]}</Descriptions.Item>*/}
                    <Descriptions.Item label="IP地址">{remote_ip}</Descriptions.Item>
                    <Descriptions.Item label="操作时间" span={2}>
                        {created_time}
                    </Descriptions.Item>
                    <Descriptions.Item label="操作类型" span={3}>
                        <Badge status="processing" text={action_types[action_type]} />
                    </Descriptions.Item>
                    <Descriptions.Item label="操作详情" span={3}>
                        {action_info}
                    </Descriptions.Item>
                    {/*<Descriptions.Item label="操作对象更改明细" span={3}>*/}
                        {/*{object_changes ? object_changes : '-'}*/}
                    {/*</Descriptions.Item>*/}
                </Descriptions>
            </ModalContent>
        );
    }
}

export default EditModal;