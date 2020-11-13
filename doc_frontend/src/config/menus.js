// import {ajax} from 'src/commons/ajax';
/*
* 菜单显示数据 返回Promise各式，支持前端硬编码、异步获取菜单数据
* */

export default function getMenus(userId) {
    // 若由后端返回可使用菜单, 在这里根据 userId 请求相关菜单权限
    console.log(userId);
    return Promise.resolve([
        {key: 'home', text: '首页', icon: 'home', path: '/', order: 2000},
        {key: 'c_doc', text: '文集管理', icon: 'file-word', path: '/admin/c_docs', order: 1900},
        {key: 'user_manage', text: '用户管理', icon: 'user',  order: 800},
        {key: 'user', parentKey: 'user_manage', text: '用户管理', icon: 'user', path: '/admin/users', order: 800},
        {key: 'team', parentKey: 'user_manage', text: '团队管理', icon: 'team', path: '/admin/teams', order: 800},
    ]);
}
