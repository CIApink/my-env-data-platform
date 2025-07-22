/**
 * 导航栏组件 - 统一管理导航栏的生成和行为
 */

class Navbar {
    constructor(options = {}) {
        this.options = {
            // 默认配置
            activeItem: options.activeItem || '',
            showUserAuth: options.showUserAuth !== false, // 默认显示用户认证
            menuItems: options.menuItems || [
                { text: '主页', href: 'index.html', id: 'home' },
                { text: '模型介绍', href: '#', id: 'model' },
                { text: '数据下载', href: 'data-download.html', id: 'download' },
                { text: '论文成果', href: '#', id: 'papers' },
                { text: '数据地图', href: 'data_echart.html', id: 'map' },
                { text: '用户服务', href: '#', id: 'service' }
            ],
            ...options
        };
    }

    /**
     * 生成导航栏HTML
     */
    generateHTML() {
        const menuItemsHTML = this.options.menuItems.map(item => {
            const activeClass = item.id === this.options.activeItem ? ' active' : '';
            return `<a href="${item.href}" class="nav-item${activeClass}">${item.text}</a>`;
        }).join('');

        const userAuthHTML = this.options.showUserAuth ? `
            <div class="user-auth" id="userAuth">
                <a href="sign in.html" class="login-signup">登录/注册</a>
                <div class="user-email" onclick="logout()" style="display: none;">邮箱 (点击注销)</div>
            </div>
        ` : '';

        return `
            <nav class="navbar">
                <div class="logo">
                    <a href="index.html">
                        <div class="main-title">MED 环境健康数据平台</div>
                        <div class="sub-title">Metrics of Environmental Data</div>
                    </a>
                </div>
                <div class="nav-menu">
                    ${menuItemsHTML}
                </div>
                ${userAuthHTML}
            </nav>
        `;
    }

    /**
     * 渲染导航栏到指定容器
     */
    render(containerId = 'navbar-container') {
        const container = document.getElementById(containerId);
        if (container) {
            container.innerHTML = this.generateHTML();
        } else {
            // 如果没有指定容器，则插入到body的开始
            document.body.insertAdjacentHTML('afterbegin', this.generateHTML());
        }
        
        // 初始化事件监听器
        this.initEventListeners();
        
        // 检查用户登录状态
        this.checkLoginStatus();
    }

    /**
     * 初始化事件监听器
     */
    initEventListeners() {
        // 导航项点击事件
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                // 移除其他active状态
                document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
                // 添加当前项的active状态
                e.target.classList.add('active');
            });
        });
    }

    /**
     * 检查用户登录状态
     */
    checkLoginStatus() {
        // 检查是否有存储的用户信息
        const userEmail = localStorage.getItem('userEmail');
        const loginSignupElement = document.querySelector('.login-signup');
        const userEmailElement = document.querySelector('.user-email');
        
        if (userEmail && loginSignupElement && userEmailElement) {
            // 用户已登录
            loginSignupElement.style.display = 'none';
            userEmailElement.style.display = 'block';
            userEmailElement.textContent = `${userEmail} (点击注销)`;
        }
    }

    /**
     * 更新活跃项
     */
    setActiveItem(itemId) {
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        
        const activeItem = document.querySelector(`.nav-item[data-id="${itemId}"]`);
        if (activeItem) {
            activeItem.classList.add('active');
        }
    }

    /**
     * 用户登录后调用
     */
    onLogin(userEmail) {
        localStorage.setItem('userEmail', userEmail);
        this.checkLoginStatus();
    }

    /**
     * 用户登出
     */
    onLogout() {
        localStorage.removeItem('userEmail');
        const loginSignupElement = document.querySelector('.login-signup');
        const userEmailElement = document.querySelector('.user-email');
        
        if (loginSignupElement && userEmailElement) {
            loginSignupElement.style.display = 'block';
            userEmailElement.style.display = 'none';
        }
    }
}

/**
 * 全局注销函数
 */
function logout() {
    if (window.navbar) {
        window.navbar.onLogout();
    }
    alert('已注销登录');
}

/**
 * 简化的初始化函数，供各页面调用
 */
function initNavbar(options = {}) {
    // 等待DOM加载完成
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.navbar = new Navbar(options);
            window.navbar.render();
        });
    } else {
        window.navbar = new Navbar(options);
        window.navbar.render();
    }
}

// 如果是模块化环境，导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Navbar;
}
