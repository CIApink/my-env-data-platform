@echo off
echo ======================================
echo  MED环境数据平台 - 管理系统安装向导
echo ======================================
echo.

echo 1. 检查项目文件...
if not exist "public\admin-dashboard.html" (
    echo [错误] 缺少管理面板文件
    pause
    exit /b 1
)

if not exist "public\js\supabase-config.js" (
    echo [错误] 缺少Supabase配置文件
    pause
    exit /b 1
)

echo [成功] 项目文件检查完成
echo.

echo 2. 下一步操作指南:
echo.
echo    1) 配置Supabase连接信息
echo       编辑: public\js\supabase-config.js
echo.
echo    2) 执行数据库初始化脚本
echo       文件: sql\setup-admin-database.sql
echo.
echo    3) 启动Web服务器并访问:
echo       - admin-setup.html (权限设置)
echo       - admin-dashboard.html (管理面板)
echo.
echo    4) 设置管理员权限:
echo       访问 admin-setup.html 页面
echo       将当前用户设置为管理员
echo.

echo ======================================
echo  安装向导完成，请按照上述步骤操作
echo ======================================
pause
