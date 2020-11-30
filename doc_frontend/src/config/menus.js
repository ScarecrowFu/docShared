// import {ajax} from 'src/commons/ajax';
/*
* 菜单显示数据 返回Promise各式，支持前端硬编码、异步获取菜单数据
* */

export default function getMenus(userId, menuType='front') {
    // 若由后端返回可使用菜单, 在这里根据 userId 请求相关菜单权限
    console.log(userId, menuType);
    const frontMenu = [
        {key: 'home', text: '首页', icon: 'home', path: '/', order: 2000},
    ]

    const adminMenu = [
        {key: 'admin', text: '后台管理', icon: 'home', path: '/admin', order: 2000},
        {key: 'c_doc', text: '文集管理', icon: 'folder', path: '/admin/c_docs', order: 1900},

        {key: 'doc_manage', text: '文档管理', icon: 'file', order: 1800},
        {key: 'doc', parentKey: 'doc_manage', text: '文档管理', icon: 'file', path: '/admin/docs/docs', order: 1800},
        {key: 'template', parentKey: 'doc_manage', text: '模板管理', icon: 'file-unknown', path: '/admin/docs/templates', order: 1800},
        {key: 'tag', parentKey: 'doc_manage', text: '标签管理', icon: 'tag', path: '/admin/docs/tags', order: 1800},
        {key: 'recycle', parentKey: 'doc_manage', text: '回收站管理', icon: 'file-protect', path: '/admin/docs/recycle', order: 1800},

        {key: 'file_manage', text: '素材管理', icon: 'upload', order: 1800},
        {key: 'image', parentKey: 'file_manage',  text: '图片管理', icon: 'picture', path: '/admin/attachments/images', order: 1800},
        {key: 'attachment',  parentKey: 'file_manage', text: '附件管理', icon: 'upload', path: '/admin/attachments/attachments', order: 1800},

        {key: 'user_manage', text: '用户管理', icon: 'user',  order: 1800},
        {key: 'user', parentKey: 'user_manage', text: '用户管理', icon: 'user', path: '/admin/users', order: 1700},
        {key: 'team', parentKey: 'user_manage', text: '团队管理', icon: 'team', path: '/admin/teams', order: 1600},
    ]

    const personalMenu = [
        {key: 'personal', text: '个人中心', icon: 'home', path: '/personal', order: 2000},
        {key: 'c_doc', text: '文集管理', icon: 'file-word', path: '/personal/c_docs', order: 1900},
    ]

    if (menuType === 'admin') {
        return Promise.resolve(adminMenu);
    } else if (menuType === 'personal') {
        return Promise.resolve(personalMenu);
    } else {
        return Promise.resolve(frontMenu);
    }
}
