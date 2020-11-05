# 菜单配置

在`/src/config/menus.js`文件中配置菜单数据，前端硬编码或异步加载菜单数据。

## 菜单特性

为了简化开发，让开发着专注于业务逻辑，系统对菜单进行了一些封装。

- 菜单支持头部、左侧、头部+左侧**三种布局方式**，详见[导航布局](LAYOUT.md)；
- 系统会基于路由path**自动选中**对应的菜单；
- 无菜单对应的二级页面也可以**选中相应父级**菜单，详见[系统路由](ROUTE.md)；
- 左侧菜单会**自动滚动**到可视范围内；
- 左侧菜单支持**展开收起**、**拖拽改变宽度**
- 页面标题、tab标签页标题、面包屑基于菜单状态**自动生成**，但也提供了对应的修改方式，详见[页面开发](PAGE.md)；
- 通过菜单配置，支持内嵌**iframe**打开页面、**a标签**方式打开页面；

## 菜单字段说明

开发人员可以根据自己的需要，配置所需字段。

字段|必须|说明
---|---|---
key|是|需要唯一
parentKey|否|用于关联父级
path|是|菜单对应的路由地址
text|是|菜单标题
icon|否|菜单图标配置
url|否|菜单对应会打开url对应的iframe页面，如果配置了url，path将无效
target|否|配合url使用，菜单将为a标签 `<a href={url} target={target}>{text}</a>`
order|否|菜单排序，数值越大越靠前显示
type|否|如果菜单数据中携带功能权限配置，type==='1' 为菜单，type==='2'为功能
code|否|功能码，如果是type==='2'，会用到此字段

----

# 样式

系统使用[less](http://lesscss.org/)进行样式的编写。

## css 模块化

为了避免多人合作样式冲突，系统对src下的less文件启用了Css Module，css文件没有使用Css Module。

[Css Module](https://github.com/css-modules/css-modules)配合[react-css-modules](https://github.com/gajus/react-css-modules)使用：

style.less
```less
.root{
    width: 100%;
    height: 100%;
}
```
Some.jsx
```jsx
import '/path/to/style.less';

export default class Some extends React.Component {
    render() {
        return (
            <div styleName="root"></div>            
        );
    }
} 
```

注：src/library中less没有启用Css Module，基础组件不使用Css Module，不利于样式覆盖；

## 主题

使用less，通过样式覆盖来实现。

### 编写主题

- less文件中使用主题相关变量；
- 编写`/src/config/theme.js`通过[less-loader](https://github.com/webpack-contrib/less-loader)的`modifyVars`覆盖less中的变量；

### 参考

- Ant Design 主题 参考：https://ant-design.gitee.io/docs/react/customize-theme-cn



