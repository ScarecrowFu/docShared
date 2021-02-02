// import {ajax} from 'src/commons/ajax';
/*
* 菜单显示数据 返回Promise各式，支持前端硬编码、异步获取菜单数据
* */
import {getSiteInfo, setSiteInfoRequest, setBaseSetInfoRequest} from 'src/utils/info'



export default function getMenus(userId, menuType='front') {
    // 若由后端返回可使用菜单, 在这里根据 userId 请求相关菜单权限
    const frontMenu = [
        {key: 'home', text: '首页', icon: 'home', path: '/', order: 10},
    ]

    const adminMenu = [
        {key: 'admin', text: '后台管理', icon: 'home', path: '/admin', order: 1000},

        {key: 'c_doc', text: '文集管理', icon: 'folder', path: '/admin/c_docs', order: 900},

        {key: 'doc_manage', text: '文档管理', icon: 'file', order: 800},
        {key: 'doc', parentKey: 'doc_manage', text: '文档管理', icon: 'file', path: '/admin/docs/docs', order: 800},
        {key: 'template', parentKey: 'doc_manage', text: '模板管理', icon: 'file-unknown', path: '/admin/docs/templates', order: 800},
        {key: 'tag', parentKey: 'doc_manage', text: '标签管理', icon: 'tag', path: '/admin/docs/tags', order: 800},
        {key: 'recycle', parentKey: 'doc_manage', text: '回收站管理', icon: 'file-protect', path: '/admin/docs/recycle', order: 800},

        {key: 'file_manage', text: '素材管理', icon: 'upload', order: 700},
        {key: 'image', parentKey: 'file_manage',  text: '图片管理', icon: 'picture', path: '/admin/attachments/images', order: 700},
        {key: 'attachment',  parentKey: 'file_manage', text: '附件管理', icon: 'upload', path: '/admin/attachments/attachments', order: 700},

        {key: 'user_manage', text: '用户管理', icon: 'user',  order: 600},
        {key: 'user', parentKey: 'user_manage', text: '用户管理', icon: 'user', path: '/admin/users/users', order: 600},
        {key: 'team', parentKey: 'user_manage', text: '团队管理', icon: 'team', path: '/admin/users/teams', order: 600},

        {key: 'system_manage', text: '系统管理', icon: 'database',  order: 500},
        {key: 'announcement', parentKey: 'system_manage', text: '公告管理', icon: 'database', path: '/admin/system/announcements', order: 500},
        {key: 'action_log', parentKey: 'system_manage', text: '日志管理', icon: 'interaction', path: '/admin/system/action_logs', order: 500},
        {key: 'reg_code', parentKey: 'system_manage', text: '注册码管理', icon: 'codepen', path: '/admin/system/reg_codes', order: 500},
        {key: 'email_code', parentKey: 'system_manage', text: '验证码管理', icon: 'mail', path: '/admin/system/email_codes', order: 500},

        {key: 'system_setting', text: '站点设置', icon: 'setting',  order: 400},
        {key: 'website_set', parentKey: 'system_setting', text: '站点信息', icon: 'setting', path: '/admin/setting/website_set', order: 400},
        {key: 'base_set', parentKey: 'system_setting', text: '基础设置', icon: 'desktop', path: '/admin/setting/base_set', order: 400},
        {key: 'mailbox_set', parentKey: 'system_setting', text: '邮箱设置', icon: 'mail', path: '/admin/setting/mailbox_set', order: 400},
    ]

    const personalMenu = [
        {key: 'personal', text: '个人中心', icon: 'home', path: '/personal', order: 2000},

        {key: 'c_doc_manage', text: '我的文集', icon: 'file-word', order: 1900},
        {key: 'c_doc', parentKey: 'c_doc_manage', text: '我的文集', icon: 'file-word', path: '/personal/c_docs/c_docs', order: 1900},
        {key: 'cooperate_c_doc', parentKey: 'c_doc_manage', text: '协作文集', icon: 'file-exclamation', path: '/personal/c_docs/cooperate_c_docs', order: 1900},

        {key: 'doc_manage', text: '我的文档', icon: 'file', order: 1800},
        {key: 'doc', parentKey: 'doc_manage', text: '我的文档', icon: 'file', path: '/personal/docs/docs', order: 1800},
        {key: 'cooperate_doc', parentKey: 'doc_manage', text: '协作文档', icon: 'file-text', path: '/personal/docs/cooperate_docs', order: 1800},
        {key: 'template', parentKey: 'doc_manage', text: '我的模板', icon: 'file-unknown', path: '/personal/docs/templates', order: 1800},
        {key: 'tag', parentKey: 'doc_manage', text: '我的标签', icon: 'tag', path: '/personal/docs/tags', order: 1800},
        {key: 'recycle', parentKey: 'doc_manage', text: '文档回收站', icon: 'file-protect', path: '/personal/docs/recycle', order: 1800},

        {key: 'file_manage', text: '我的素材', icon: 'upload', order: 1700},
        {key: 'image', parentKey: 'file_manage',  text: '我的图片', icon: 'picture', path: '/personal/attachments/images', order: 1700},
        {key: 'attachment',  parentKey: 'file_manage', text: '我的附件', icon: 'upload', path: '/personal/attachments/attachments', order: 1700},

        {key: 'personal_setting', text: '个人设置', icon: 'radius-setting',  order: 1600},
        {key: 'personal_set', parentKey: 'personal_setting', text: '个人信息', icon: 'radius-setting', path: '/personal/setting/personal_set', order: 1600},
        {key: 'password_set', parentKey: 'personal_setting', text: '修改密码', icon: 'gateway', path: '/personal/setting/password_set', order: 1600},
        {key: 'token_set', parentKey: 'personal_setting', text: '账号token', icon: 'gold', path: '/personal/setting/token_set', order: 1600},

        // {key: 'config_help', text: '配置手册', icon: 'gift', path: '/personal/config_help', order: 1500},
        // {key: 'use_help', text: '使用手册', icon: 'shop', path: '/personal/use_help', order: 1500},
    ]

    setSiteInfoRequest();
    setBaseSetInfoRequest();

    if (menuType === 'admin') {
        return Promise.resolve(adminMenu);
    } else if (menuType === 'personal') {
        let siteInfo = getSiteInfo();
        let site_use_help = siteInfo?.site_use_help? siteInfo.site_use_help : null
        let site_config_help = siteInfo?.site_config_help? siteInfo.site_config_help : null
        if (site_config_help !== '' && site_config_help !== null && site_config_help !== undefined) {
            personalMenu.push({key: 'config_help', text: '配置手册', icon: 'gift', url: site_config_help, target: '_blank', order: 1500})
        } else {
            personalMenu.push({key: 'config_help', text: '配置手册', icon: 'gift', path: '/personal/config_help', order: 1500})
            // console.log('push')
        }
        if (site_use_help !== '' && site_use_help !== null && site_use_help !== undefined) {
            personalMenu.push({key: 'use_help', text: '使用手册', icon: 'shop', url: site_use_help, target: '_blank', order: 1500})
        } else {
            personalMenu.push({key: 'use_help', text: '使用手册', icon: 'shop', path: '/personal/use_help', order: 1500})
        }
        return Promise.resolve(personalMenu);
    } else {
        return Promise.resolve(frontMenu);
    }
}
