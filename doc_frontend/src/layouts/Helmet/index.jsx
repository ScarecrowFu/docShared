import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Helmet} from 'react-helmet';
import {anonymousSettingSpecifyList} from 'src/apis/sys_set';
import {getSiteInfo, setSiteInfo} from "src/utils/info";

/**
 * 操作封装，Markdown 编辑器
 */
export default class CustomHelmet extends Component {
    static propTypes = {
        request: PropTypes.bool,  // 是否从后端接口获取
        titleText: PropTypes.string,  // 后续标题
    };

    static defaultProps = {
        request: false,
        titleText: '',
    };

    state = {
        site_name: 'docShared',
        site_sub_title: null,
        site_keyword: null,
        site_description: null,
        site_use_help: null,
        site_config_help: null,
    };


    handleMetaInfo = async () => {
        let siteInfo = getSiteInfo();
        if (siteInfo) {
            this.setState({ site_name: siteInfo?.site_name? siteInfo.site_name : '' });
            this.setState({ site_sub_title: siteInfo?.site_sub_title? siteInfo.site_sub_title : '' });
            this.setState({ site_keyword: siteInfo?.site_keyword? siteInfo.site_keyword : '' });
            this.setState({ site_description: siteInfo?.site_description? siteInfo.site_description : '' });
            this.setState({ site_use_help: siteInfo?.site_use_help? siteInfo.site_use_help : '' });
            this.setState({ site_config_help: siteInfo?.site_config_help? siteInfo.site_config_help : '' });
        } else {
            await anonymousSettingSpecifyList()
                .then(res => {
                    const results = res.data?.results;
                    setSiteInfo(results);
                    this.setState({ site_name: results?.site_name? results.site_name : '' });
                    this.setState({ site_sub_title: results?.site_sub_title? results.site_sub_title : '' });
                    this.setState({ site_keyword: results?.site_keyword? results.site_keyword : '' });
                    this.setState({ site_description: results?.site_description? results.site_description : '' });
                    this.setState({ site_use_help: results?.site_use_help? results.site_use_help : '' });
                    this.setState({ site_config_help: results?.site_config_help? results.site_config_help : '' });
                }, error => {
                    console.log(error.response);
                })
        }
    }

    componentDidMount() {
        const {request} = this.props;
        if (request) {
            this.handleMetaInfo();
        }
    }

    render() {
        const {titleText} = this.props;
        const {
            site_name,
            site_sub_title,
            site_keyword,
            site_description,
        } = this.state;

        return (
            <Helmet>
                <meta charSet="utf-8" />
                <meta name="keywords" content={site_keyword? site_keyword : '文档,分享,管理,Python,Django,React,Admin'} />
                <meta name="description" content={site_description? site_description : '基于Python & React 开发的在线文档系统，支持 Markdown 和所见即所得的富文本编辑，适合作为个人和小型团队的文档、笔记、知识管理工具。'}/>
                <meta name="author" content="司马扶妖(Alan)" />
                <title>{titleText ? site_name + ' ' + site_sub_title + ' ' + titleText : site_name + ' ' + site_sub_title}</title>
                <link rel="canonical" href="http://www.fualan.com" />
            </Helmet>
        );
    }
}
