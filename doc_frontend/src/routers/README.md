# 系统路由

系统路由使用 [react-router](https://reacttraining.com/react-router/web/guides/quick-start)。
路由使用最多的场景就是一个path对应一个页面，但是开发人员不得不去编写配置文件，多人协作时，配置文件还经常冲突。
系统通过脚本，简化路由配置。

## 路由配置方式

通过routeLoader 将路由内容填充到 `/src/routes/pageRoutes.js` 文件，支持两种写法：

1. 常量方式

    ```javascript
    export const PAGE_ROUTE = '/path';
    ```
   
1. 页面config装饰器

    ```javascript
   
    @config({
        path: '/path',
    })
    export default class SomePage extends React.Component {
        // code
    }
    ```

比如SomePage.jsx中有上面其中任意一种写法，routeLoader最终会在`/src/routes/pageRoutes.js`文件中填充如下路由配置：

```javascript
{
    path: '/path',
    component: () => import('/path/to/SomePage.jsx'),
},
```

## 二级页面
    
二级页面如果要保持父级菜单的选中状态，以父级path开始并以`/_/`作为分隔符即可：`parent/path/_/child/path`

```javascript
// parent page 
@config({
    path: '/parent/path'
})
export default class Parent extends React.Component {
    // code
}

// child page
@config({
    path: '/parent/path/_/child/path'
})
export default class Parent extends React.Component {
    // code
}
```
