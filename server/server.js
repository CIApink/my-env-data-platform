// 引入必要模块
const express = require('express'); // 用于创建服务器
const cors = require('cors'); // 解决跨域问题
const dotenv = require('dotenv'); // 加载环境变量
const authRoutes = require('./routes/auth'); // 用户认证路由
const dataRoutes = require('./routes/data'); // 数据下载路由

dotenv.config(); // 加载 .env 文件中的环境变量

const app = express(); // 创建 Express 应用
const PORT = process.env.PORT || 5000; // 服务器端口

// 中间件
app.use(cors()); // 允许跨域请求
app.use(express.json()); // 解析 JSON 请求体
app.use(express.static('public')); // 提供静态文件服务

// 路由
app.use('/api/auth', authRoutes); // 用户认证相关路由
app.use('/api/data', dataRoutes); // 数据下载相关路由

// 启动服务器
app.listen(PORT, () => {
    console.log(`服务器已启动，访问地址：http://localhost:${PORT}`);
});