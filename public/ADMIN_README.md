# 管理面板使用指南

## 概述

这是一个基于Supabase的用户管理系统，为MED环境数据平台提供完整的用户审核、管理和监控功能。

## 功能特点

### 🎯 核心功能
- **用户审核**: 对新注册用户进行审核，支持通过/拒绝/暂停操作
- **用户管理**: 查看、编辑、搜索用户信息
- **数据可视化**: 实时统计用户数据，包括注册趋势、状态分布等
- **权限管理**: 基于角色的访问控制(RBAC)
- **活动日志**: 记录所有管理操作的详细日志

### 📊 数据统计
- 总用户数、待审核数、已通过数
- 本周/本月新增用户统计
- 管理员用户数量
- 用户状态分布图表

### 🔍 高级功能
- 实时搜索用户(姓名/邮箱)
- 按状态筛选用户
- 分页浏览用户列表
- 批量操作支持
- 数据导出功能

## 安装配置

### 1. 数据库设置

首先在Supabase中执行SQL脚本来创建必要的表结构：

```sql
-- 执行 public/sql/setup-admin-database.sql 文件中的所有SQL语句
```

### 2. 环境变量配置

在项目根目录创建 `.env` 文件：

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 3. 文件部署

将以下文件部署到您的Web服务器：

```
public/
├── admin-dashboard.html      # 管理面板主页面
├── js/
│   ├── supabase-config.js   # Supabase配置
│   └── admin-dashboard.js   # 管理功能逻辑
└── sql/
    └── setup-admin-database.sql  # 数据库初始化脚本
```

## 使用说明

### 访问管理面板

1. 访问 `admin-dashboard.html`
2. 系统会自动检查登录状态和管理员权限
3. 只有具备 `admin` 或 `super_admin` 角色的用户才能访问

### 用户角色说明

- **user**: 普通用户，只能访问基本功能
- **admin**: 管理员，可以审核用户、管理用户信息
- **super_admin**: 超级管理员，拥有所有权限，包括系统设置

### 用户状态说明

- **pending**: 待审核，新注册用户的默认状态
- **approved**: 已通过，可以正常使用平台功能
- **rejected**: 已拒绝，不能使用平台功能
- **suspended**: 已暂停，临时禁用账户

### 主要操作流程

#### 1. 审核新用户
```
1. 点击侧边栏"待审核用户"或筛选"待审核"状态
2. 查看用户信息和注册详情
3. 点击"通过"或"拒绝"按钮
4. 填写必要的备注信息
5. 确认操作
```

#### 2. 管理现有用户
```
1. 在用户列表中找到目标用户
2. 点击"查看"查看详细信息
3. 点击"编辑"修改用户信息
4. 根据需要进行"暂停"或"恢复"操作
```

#### 3. 搜索和筛选
```
1. 使用顶部搜索框输入用户姓名或邮箱
2. 使用状态下拉菜单筛选特定状态的用户
3. 结果会实时更新
```

## 数据库结构

### profiles表
```sql
- id: 用户UUID (主键)
- email: 邮箱地址
- full_name: 用户姓名
- status: 用户状态
- role: 用户角色
- organization: 组织/机构
- phone: 电话号码
- created_at: 注册时间
- updated_at: 更新时间
- last_sign_in_at: 最后登录时间
```

### user_activity_logs表
```sql
- id: 日志ID
- user_id: 被操作用户ID
- admin_id: 操作管理员ID
- action: 操作类型
- details: 操作详情(JSON)
- created_at: 操作时间
```

## 安全特性

### 1. 行级安全(RLS)
- 所有表都启用了RLS
- 用户只能访问自己的数据
- 管理员可以访问所有用户数据

### 2. 权限验证
- 前端和后端双重权限检查
- 基于JWT令牌的身份验证
- 细粒度的操作权限控制

### 3. 操作日志
- 所有管理操作都会记录详细日志
- 包括操作时间、操作者、被操作对象
- 支持审计和追溯

## API接口

### 获取用户统计
```javascript
const { data: stats } = await supabase
  .from('user_stats')
  .select('*')
  .single();
```

### 审核用户
```javascript
const { error } = await supabaseAdmin
  .from('profiles')
  .update({ 
    status: 'approved',
    approved_by: adminId,
    approved_at: new Date().toISOString()
  })
  .eq('id', userId);
```

### 搜索用户
```javascript
const { data: users } = await supabaseAdmin
  .from('profiles')
  .select('*')
  .or(`email.ilike.%${query}%,full_name.ilike.%${query}%`);
```

## 故障排除

### 常见问题

1. **无法访问管理面板**
   - 检查用户是否已登录
   - 确认用户角色是否为admin或super_admin
   - 检查Supabase连接配置

2. **数据加载失败**
   - 检查数据库表是否正确创建
   - 确认RLS策略是否正确设置
   - 检查网络连接和API密钥

3. **权限错误**
   - 确认使用的是Service Role Key而不是Anon Key
   - 检查RLS策略配置
   - 验证用户角色设置

### 调试模式

在浏览器控制台中启用调试：

```javascript
// 查看当前用户信息
console.log(await supabase.auth.getUser());

// 查看用户权限
const { data } = await supabase
  .from('profiles')
  .select('role, status')
  .eq('id', 'user-id');
console.log(data);
```

## 更新日志

- **v1.0.0**: 初始版本，基础用户管理功能
- 支持用户审核、状态管理
- 实时数据统计和可视化
- 完整的权限控制系统

## 技术栈

- **前端**: HTML5, TailwindCSS, JavaScript ES6+
- **后端**: Supabase (PostgreSQL + Auth + API)
- **认证**: Supabase Auth with JWT
- **数据库**: PostgreSQL with RLS
- **实时更新**: Supabase Realtime (可选)

## 贡献指南

如需扩展功能或报告问题，请：

1. 查看现有代码结构
2. 遵循现有的代码风格
3. 添加适当的错误处理
4. 更新相关文档
5. 测试新功能的权限控制
