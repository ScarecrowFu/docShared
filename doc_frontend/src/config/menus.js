// import {ajax} from 'src/commons/ajax';
/*
* 菜单显示数据 返回Promise各式，支持前端硬编码、异步获取菜单数据
* */

export default function getMenus(userId) {
    // 若由后端返回可使用菜单, 在这里根据 userId 请求相关菜单权限
    console.log(userId);
    return Promise.resolve([
        {key: 'home', text: '首页', icon: 'home', path: '/', order: 900},
        {key: 'user', text: '用户管理', icon: 'user', path: '/users', order: 800},
    ]);
}
