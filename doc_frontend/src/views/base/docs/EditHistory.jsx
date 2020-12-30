import React, {Component} from 'react';
import config from 'src/utils/Hoc/configHoc';
import ModalContent from 'src/library/ModalHoc/ModalContent';
import ReactDiffViewer from 'react-diff-viewer';
import {
    getDocHistory,
    getDocHistoryDetail,
} from 'src/apis/doc';
import './style.less';
import Table from "src/library/Table";
import Operator from "src/library/Operator";
import {Modal} from "antd";


@config({
    modal: {
        title: '历史记录',
        maskClosable: true
    },
})
class EditHistory extends Component {
    state = {
        loading: false, // 页面加载loading
        dataSource: [],     // 表格数据
        selectedRowKeys: [],// 表格中选中行keys
        total: 0,           // 分页中条数
        pageNum: 1,         // 分页当前页
        pageSize: 10,       // 分页每页显示条数
        historyDetailVisible: false,       // 历史详情
        current_content: '',       // 历史详情
        content: '',       // 历史详情
    };

    columns = [
        { title: '时间', dataIndex: 'created_time', sorter: true, width: 200 },
        {
            title: '修改人', dataIndex: 'creator', sorter: true, width: 100,
            render: (value, record) => {
                if (value) {
                    return value.nickname;
                }
                return '-';
            }
        },
        {
            title: '操作', dataIndex: 'operator', width: 120,
            render: (value, record) => {
                const {id} = record;
                const items = [
                    {
                        label: '详情',
                        onClick: () => this.handleShowDetail(id),
                    },
                ];
                return <Operator items={items}/>;
            },
        },
    ];



    fetchData = () => {
        if (this.state.loading) return;
        const {id} = this.props;
        this.setState({loading: true});
        getDocHistory(id)
            .then(res => {
                const data = res.data;
                this.setState({dataSource: data.results});
            }, error => {
                console.log(error.response);
            })
            .finally(() => this.setState({loading: false}));
    };


    componentDidMount() {
        this.fetchData();
    }

    handleShowDetail = (history_id) => {
        this.setState({ historyDetailVisible: true});
        const {id} = this.props;
        console.log('history_id', history_id);
        getDocHistoryDetail(id, {'history_id':history_id})
            .then(res => {
                const data = res.data;
                this.setState({current_content: data.results.current_content});
                this.setState({content: data.results.content});
            }, error => {
                console.log(error.response);
            })
            .finally(() => this.setState({loading: false}));
    };

    handleCloseDetail = () => {
        this.setState({ historyDetailVisible: false})
    };

    render() {
        const { onCancel} = this.props;
        const {
            loading,
            dataSource,
            pageNum,
            pageSize,
        } = this.state;
        return (
            <ModalContent
                loading={loading}
                cancelText="关 闭"
                onCancel={onCancel}
            >
                <Table
                    loading={loading}
                    columns={this.columns}
                    dataSource={dataSource}
                    rowKey="id"
                    serialNumber={false}
                    pageNum={pageNum}
                    pageSize={pageSize}
                    showSorterTooltip={true}
                />

                <Modal
                    title="历史记录详情"
                    visible={this.state.historyDetailVisible}
                    onOk={() => this.handleCloseDetail()}
                    onCancel={() => this.handleCloseDetail()}
                    width='80%'
                >
                    <div style={{'height': '800px', 'overflow': 'scroll'}}>
                        <ReactDiffViewer
                            oldValue={this.state.current_content}
                            newValue={this.state.content}
                            splitView={true}
                            extraLinesSurroundingDiff={100}
                        />
                    </div>

                </Modal>
            </ModalContent>
        );
    }
}

export default EditHistory;