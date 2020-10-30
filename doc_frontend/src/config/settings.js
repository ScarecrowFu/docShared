/**
 * 自定义的全局变量配置
 **/
module.exports = {
    // 默认的接口地址 如果是开发环境和生产环境走vab-mock-server，当然你也可以选择自己配置成需要的接口地址
    baseURL:
        process.env.NODE_ENV === "development" || process.env.NODE_ENV === "preview" || process.env.NODE_ENV === "test"
            ? "http://127.0.0.1:8000/"
            : "",
    // 是否显示页面底部版权信息
    footerCopyright: true,
    // 登录信息保存名称
    authInfoName: "authInfo",
    // 登录信息 存储方式 localStorage sessionStorage cookie
    authInfoStorage: "localStorage",
    //token失效回退到登录页时是否记录本次的路由
    recordRoute: true,
    // 默认横纵布局 horizontal vertical
    layout: "vertical",
    // 是否开启主题配置按钮
    themeBar: true,
    // 是否显示多标签页
    tagsBar: true,
    // 配后端数据的默认接收方式
    contentType: "application/json",
    // 消息框默认消失时间 ms
    messageDuration: 2000,
    // 默认最长请求时间
    requestTimeout: 10000,
    // 操作正常 code
    successCode: 200,
    // 请求有误
    badRequestCode: 400,
    //需要用户验证,token 过期
    unAuthCode: 401,
    //拒绝执行
    forbiddenCode: 403,
    //请求失败，请求所希望得到的资源未被在服务器上发现
    notFoundCode: 404,
    //服务器端错误
    errorServerCode: 500,
    //是否显示在页面高亮错误
    errorLog: ["development", "test", "production"],
    //是否开启登录拦截
    loginInterception: true,
    //intelligence和all两种方式，前者后端权限只控制permissions不控制view文件的import（前后端配合，减轻后端工作量），all方式完全交给后端前端只负责加载
    authentication: "intelligence",
};
