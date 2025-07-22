const express = require('express');
const router = express.Router();

// 模拟数据下载接口
router.get('/download', (req, res) => {
    // 检查用户是否已登录 (模拟)
    const token = req.headers.authorization;
    if (!token) {
        return res.status(401).json({ message: '未授权，请先登录' });
    }

    // 返回模拟数据
    res.json({ message: '数据下载成功', data: [1, 2, 3, 4, 5] });
});

module.exports = router;