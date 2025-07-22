# MED环境数据平台 - 管理系统使用指南

## 概述

本项目是一个基于Supabase的环境数据平台，现已集成完整的用户管理和权限控制系统。

## 文件结构

```
public/
├── admin-dashboard.html     # 管理员面板主页
├── admin-setup.html         # 权限设置页面  
├── css/
│   └── navbar.css          # 统一导航栏样式
├── js/
│   ├── navbar.js           # 导航栏组件逻辑
│   ├── supabase-config.js  # Supabase配置文件
│   └── admin-dashboard.js  # 管理面板功能
└── sql/
    └── setup-admin-database.sql  # 数据库初始化脚本
```

## 功能特性

### 1. 统一导航栏系统
- **文件**: `css/navbar.css`, `js/navbar.js`
- **功能**: 
  - 响应式设计，支持移动端
  - 基于角色的菜单显示
  - 自动用户状态检测
  - 统一样式管理

### 2. 用户权限管理
- **角色类型**:
  - `user`: 普通用户
  - `admin`: 管理员
  - `super_admin`: 超级管理员

- **用户状态**:
  - `pending`: 待审核
  - `approved`: 已通过
  - `rejected`: 已拒绝
  - `suspended`: 已暂停

### 3. 管理员面板
- **文件**: `admin-dashboard.html`, `js/admin-dashboard.js`
- **功能**:
  - 用户列表查看与搜索
  - 用户状态管理（审核/拒绝/暂停）
  - 实时统计数据
  - 批量操作支持
  - 活动日志记录

### 4. 权限设置工具
- **文件**: `admin-setup.html`
- **功能**:
  - 快速设置当前用户权限
  - 创建测试用户
  - 生成测试数据
  - 清理测试数据

## 部署指南

### 1. 环境配置

1. **创建Supabase项目**
   - 访问 [Supabase](https://supabase.com)
   - 创建新项目
   - 获取项目URL和API密钥

2. **配置Supabase连接**
   ```javascript
   // 在 js/supabase-config.js 中配置
   const SUPABASE_URL = 'your-project-url';
   const SUPABASE_ANON_KEY = 'your-anon-key';
   const SUPABASE_SERVICE_ROLE_KEY = 'your-service-role-key';
   ```

### 2. 数据库初始化

在Supabase SQL编辑器中执行 `sql/setup-admin-database.sql` 脚本：

```sql
-- 创建profiles表
-- 设置RLS策略
-- 创建触发器和函数
-- 初始化系统数据
```

### 3. 安全配置

1. **启用Row Level Security (RLS)**
   - 所有表都已配置RLS策略
   - 确保只有授权用户可以访问敏感数据

2. **服务密钥使用**
   - 仅在管理功能中使用服务密钥
   - 普通用户操作使用匿名密钥

## 使用流程

### 1. 首次设置

1. **部署项目文件**
   - 上传所有文件到Web服务器
   - 确保Supabase配置正确

2. **初始化管理员**
   - 访问 `admin-setup.html`
   - 将当前用户设置为管理员角色
   - 设置用户状态为"已通过"

3. **测试功能**
   - 生成测试数据
   - 验证管理面板功能
   - 测试用户审核流程

### 2. 日常管理

1. **用户审核**
   - 登录管理面板
   - 查看待审核用户
   - 批准或拒绝用户申请

2. **用户管理**
   - 搜索和筛选用户
   - 修改用户状态
   - 查看用户活动日志

3. **系统监控**
   - 查看用户统计数据
   - 监控系统活动日志
   - 管理用户权限

## 页面集成

所有页面都可以轻松集成统一导航栏：

```html
<!-- 1. 引入样式和脚本 -->
<link rel="stylesheet" href="css/navbar.css">
<script src="js/navbar.js"></script>

<!-- 2. 添加导航栏容器 -->
<div id="navbar-container"></div>

<!-- 3. 初始化导航栏 -->
<script>
initNavbar({ 
    activeItem: 'home'  // 设置当前活跃项
});
</script>
```

## 技术栈

- **前端**: HTML5, CSS3, JavaScript ES6+, Tailwind CSS
- **后端**: Supabase (PostgreSQL + Auth + API)
- **样式**: 响应式设计，MiSans字体
- **认证**: JWT Token，Row Level Security

## 安全考虑

1. **数据隔离**: 使用RLS确保用户只能访问授权数据
2. **权限验证**: 前后端双重权限检查
3. **SQL注入防护**: 使用参数化查询
4. **XSS防护**: 输入输出过滤和转义

## 常见问题

### Q: 无法访问管理面板？
A: 确保用户已设置为管理员角色，状态为"已通过"

### Q: 导航栏样式异常？
A: 检查 `css/navbar.css` 是否正确加载

### Q: 数据库连接失败？
A: 验证Supabase配置信息是否正确

### Q: 权限设置不生效？
A: 检查RLS策略是否正确启用

## 扩展建议

1. **多语言支持**: 添加国际化功能
2. **主题切换**: 支持深色/浅色主题
3. **数据导出**: 用户数据导出功能
4. **通知系统**: 邮件/短信通知
5. **API接口**: RESTful API for 第三方集成

## 联系支持

如有问题或建议，请通过以下方式联系：
- 项目文档更新
- 功能改进建议
- Bug报告和修复

---

*最后更新: 2024年12月*
