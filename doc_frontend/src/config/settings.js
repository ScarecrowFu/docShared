/**
 * 自定义的全局变量配置
 **/
module.exports = {
    // 默认的接口地址 如果是开发环境和生产环境走vab-mock-server，当然你也可以选择自己配置成需要的接口地址
    baseURL:
        process.env.NODE_ENV === "development" || process.env.NODE_ENV === "preview" || process.env.NODE_ENV === "test"
            ? "http://127.0.0.1:8000/"
            : "/",
    // 存储前缀，用来区分不同用户数据，否则同一台电脑，不同人存储数据会互相干扰
    keyPrefix: "doc",
    // 登录信息保存名称
    authInfoKey: "authInfo",
    // 站点信息
    SiteInfoKey: "siteInfo",
    // 基础设置
    BaseSetInfoKey: "baseSetInfo",
    // 是否显示页面底部版权信息
    footerCopyright: true,
    // 是否开启主题配置按钮
    themeBar: true,
    // 是否显示多标签页
    tagsBar: true,
    // 配后端数据的默认接收方式
    contentType: "application/json",
    // 消息框默认消失时间 s
    messageDuration: 3,
    // 默认最长请求时间
    requestTimeout: 60000,
};
