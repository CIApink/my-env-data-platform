# 导航栏组件使用指南

## 概述

本项目已实现统一的导航栏组件管理系统，避免了在每个页面中重复编写导航栏代码。现在只需要修改一个地方，就能更新所有页面的导航栏样式和功能。

## 文件结构

```
public/
├── css/
│   └── navbar.css          # 导航栏统一样式文件
├── js/
│   └── navbar.js           # 导航栏组件JavaScript
├── navbar-demo.html        # 使用示例和演示页面
└── [其他页面].html         # 已更新使用新导航栏组件
```

## 快速开始

### 在现有页面中使用

1. **引入必要文件**（在 `<head>` 标签中）：
```html
<link rel="stylesheet" href="css/navbar.css">
<script src="js/navbar.js"></script>
```

2. **添加导航栏容器**（在 `<body>` 标签开始处）：
```html
<div id="navbar-container"></div>
```

3. **初始化导航栏**（在页面脚本中）：
```html
<script>
    // 基础初始化
    initNavbar();
    
    // 或者带配置的初始化
    initNavbar({ 
        activeItem: 'home' // 设置当前页面对应的活跃项
    });
</script>
```

### 在新页面中使用

参考 `navbar-demo.html` 文件，它展示了完整的使用方法。

## 配置选项

### activeItem

设置当前页面对应的活跃导航项：

- `'home'` - 主页
- `'model'` - 模型介绍  
- `'download'` - 数据下载
- `'papers'` - 论文成果
- `'map'` - 数据地图
- `'service'` - 用户服务

```javascript
initNavbar({ activeItem: 'download' });
```

### showUserAuth

控制是否显示用户认证区域：

```javascript
initNavbar({ 
    showUserAuth: false  // 隐藏登录/注册区域
});
```

### menuItems

自定义菜单项（高级用法）：

```javascript
initNavbar({
    menuItems: [
        { text: '首页', href: 'index.html', id: 'home' },
        { text: '关于', href: 'about.html', id: 'about' },
        // 更多菜单项...
    ]
});
```

## 用户状态管理

### 登录状态

```javascript
// 用户登录后调用
window.navbar.onLogin('user@example.com');

// 用户登出
window.navbar.onLogout();
```

### 动态更改活跃项

```javascript
// 切换活跃的导航项
window.navbar.setActiveItem('download');
```

## 样式自定义

所有样式都在 `css/navbar.css` 中定义，包括：

- 颜色主题（CSS变量）
- 字体设置
- 响应式布局
- 悬停效果

### 修改颜色主题

在 `css/navbar.css` 的 `:root` 选择器中修改CSS变量：

```css
:root {
    --primary-blue: #C1E9D2;
    --brand-green: #4ab6a4c8;
    --accent-blue: #4ab6a4c8;
    --light-blue: #6fb8ed;
}
```

## 响应式设计

导航栏自动适配不同屏幕尺寸：

- **桌面端** (>768px): 水平布局
- **平板端** (768px-480px): 紧凑水平布局  
- **移动端** (<480px): 垂直布局

## 最佳实践

1. **保持一致性**: 所有页面都应该使用相同的导航栏组件
2. **正确设置activeItem**: 每个页面都应该设置对应的活跃项
3. **及时更新**: 当添加新页面时，考虑是否需要在导航栏中添加对应链接
4. **测试响应式**: 确保在不同设备上导航栏都能正常工作

## 故障排除

### 导航栏不显示

1. 检查是否正确引入了CSS和JS文件
2. 确认 `initNavbar()` 是否被调用
3. 检查浏览器控制台是否有错误信息

### 样式异常

1. 确认CSS文件路径正确
2. 检查是否有CSS冲突
3. 确认字体文件路径正确

### JavaScript错误

1. 确认JS文件路径正确
2. 检查是否在DOM加载完成后调用 `initNavbar()`
3. 查看浏览器控制台的错误信息

## 演示页面

访问 `navbar-demo.html` 查看完整的功能演示和交互示例。

## 更新日志

- **v1.0.0**: 初始版本，实现基础导航栏组件功能
- 支持统一样式管理
- 支持活跃状态管理
- 支持用户登录状态
- 支持响应式设计
