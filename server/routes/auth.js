const express = require('express');
const bcrypt = require('bcryptjs'); // 用于加密密码
const jwt = require('jsonwebtoken'); // 用于生成 Token
const router = express.Router();

// 模拟用户数据库
const users = [];

// 注册用户
router.post('/register', async (req, res) => {
    const { username, password } = req.body;

    // 检查用户名是否已存在
    const existingUser = users.find(user => user.username === username);
    if (existingUser) {
        return res.status(400).json({ message: '用户名已存在' });
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10);

    // 保存用户
    users.push({ username, password: hashedPassword });
    res.status(201).json({ message: '注册成功' });
});

// 用户登录
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    // 查找用户
    const user = users.find(user => user.username === username);
    if (!user) {
        return res.status(400).json({ message: '用户名或密码错误' });
    }

    // 验证密码
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        return res.status(400).json({ message: '用户名或密码错误' });
    }

    // 生成 Token
    const token = jwt.sign({ username }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
});

module.exports = router;