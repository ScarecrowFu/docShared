import React, {Component} from 'react';
import {Row, Col, Card, Timeline, Tooltip, Image, Divider, Calendar, Typography} from 'antd'
import PageContent from 'src/layouts/PageContent';
import NumberCard from 'src/components/NumberCard'
import UserCard from 'src/components/UserCard'
import './style.less';
import QueryBar from "src/library/QueryBar"
import {SmileTwoTone} from "@ant-design/icons";
import {getDashboardStatistics} from 'src/apis/statistics'
import {getActionLogList} from "src/apis/action_log"
import PropTypes from "prop-types"


export default class HomeBase extends Component {

        static propTypes = {
                personal: PropTypes.bool,
        };


        static defaultProps = {
                personal: true,
        };

        state = {
                loading: false,     // 表格加载数据loading
                statistics_data: {},     // 表格数据
                action_log_data: [],     // 操作日誌
        };

        handleStatistics = () => {
                if (this.state.loading) return;
                this.setState({ deleting: true });
                getDashboardStatistics({'personal': this.props.personal})
                    .then(res => {
                            const data = res.data;
                            this.setState({ statistics_data: data.results });
                    }, error => {
                            console.log(error.response);
                    })
                    .finally(() => this.setState({ deleting: false }));
        }

        handleActionLog = () => {
                if (this.state.loading) return;
                this.setState({ loading: true });
                getActionLogList({'ordering': '-created_time', 'personal': this.props.personal})
                    .then(res => {
                            const data = res.data;
                            this.setState({ action_log_data: data.results });
                    }, error => {
                            console.log(error.response);
                    })
                    .finally(() => this.setState({ loading: false }));

        };

        componentDidMount() {
                this.handleStatistics();
                this.handleActionLog();
        }

        render() {
                const {
                        statistics_data,
                        action_log_data,
                } = this.state;

                const {
                        personal,
                } = this.props;

                const { Text } = Typography;

                return (
                    <PageContent>
                            <QueryBar>
                                    <Row gutter={24}>
                                            <Col lg={6} md={12}>
                                                    <NumberCard icon="team" color="#8fc9fb" title="文集" number={statistics_data.c_doc_total? statistics_data.c_doc_total : 0} />
                                            </Col>
                                            <Col lg={6} md={12}>
                                                    <NumberCard icon="team" color="#8fc9fb" title="文档" number={statistics_data.doc_total? statistics_data.doc_total : 0} />
                                            </Col>
                                            {personal?
                                            <Col lg={6} md={12}>
                                                    <NumberCard icon="team" color="#8fc9fb" title="图片" number={statistics_data.image_total? statistics_data.image_total : 0} />
                                            </Col> : null}
                                            {personal?
                                            <Col lg={6} md={12}>
                                                    <NumberCard icon="team" color="#8fc9fb" title="附件" number={statistics_data.attachment_total? statistics_data.attachment_total : 0} />
                                            </Col> : null}
                                            {personal? null :
                                            <Col lg={6} md={12}>
                                                    <NumberCard icon="team" color="#8fc9fb" title="用户" number={statistics_data.user_total? statistics_data.user_total : 0} />
                                            </Col>}
                                            {personal? null :
                                            <Col lg={6} md={12}>
                                                    <NumberCard icon="team" color="#8fc9fb" title="团队" number={statistics_data.team_total? statistics_data.team_total : 0} />
                                            </Col>
                                            }
                                    </Row>
                            </QueryBar>
                            <div styleName="page-content">
                                    <QueryBar>
                                            <Row gutter={24}>
                                                    <Col span={12} styleName="card">
                                                            <Card
                                                                title={<span><Tooltip title="操作日志"><SmileTwoTone /></Tooltip>操作日志</span>}
                                                                bordered={true}
                                                            >
                                                                    <Timeline>
                                                                            {action_log_data.map(function (item) {
                                                                                    return (
                                                                                        <Timeline.Item >
                                                                                                <Text>{item.user?.nickname}</Text>
                                                                                                <Text type="success">{item.action_info}</Text>
                                                                                                <Text type="secondary"> {item.created_time}</Text>
                                                                                                <Text>({item.remote_ip})</Text>
                                                                                        </Timeline.Item>
                                                                                    )
                                                                            })}
                                                                    </Timeline>
                                                            </Card>
                                                    </Col>

                                                    <Col span={12} styleName="card">
                                                            <Card
                                                                title={<span><Tooltip title="当前时间"><SmileTwoTone /></Tooltip>当前时间</span>}
                                                                bordered={true}
                                                            >
                                                                    <Calendar fullscreen={false}/>
                                                            </Card>
                                                    </Col>
                                            </Row>
                                    </QueryBar>

                                    <QueryBar>
                                            <Row gutter={24}>
                                                    <Col span={12} styleName="card">
                                                            <UserCard
                                                                username="司马扶妖"
                                                                email="fualan1990@gmail.com"
                                                                github="https://github.com/ScarecrowFu"
                                                                desc=""
                                                            >
                                                            </UserCard>
                                                    </Col>

                                                    <Col span={12} styleName="card">
                                                            <Card
                                                                title={<span><Tooltip title="支持项目发展"><SmileTwoTone /></Tooltip>支持项目发展</span>}
                                                                bordered={true}
                                                            >
                                                                    <div styleName="image-group">
                                                                            <Image
                                                                                styleName="image"

                                                                                width={200}
                                                                                src="https://gw.alipayobjects.com/zos/rmsportal/KDpgvguMpGfqaHPjicRK.svg"
                                                                            />
                                                                            <Divider />
                                                                            <Image
                                                                                styleName="image"
                                                                                width={200}
                                                                                src="https://gw.alipayobjects.com/zos/rmsportal/KDpgvguMpGfqaHPjicRK.svg"
                                                                            />
                                                                    </div>
                                                            </Card>
                                                    </Col>
                                            </Row>
                                    </QueryBar>
                            </div>
                    </PageContent>
                );
        }
}