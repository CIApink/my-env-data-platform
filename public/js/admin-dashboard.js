/**
 * 管理页面功能模块
 */

class AdminDashboard {
    constructor() {
        this.currentPage = 1;
        this.pageSize = 10;
        this.currentFilter = 'all';
        this.searchQuery = '';
        this.users = [];
        this.stats = {};
        
        this.init();
    }

    async init() {
        try {
            // 检查管理员权限
            await this.checkAdminPermission();
            
            // 加载初始数据
            await this.loadDashboardData();
            
            // 绑定事件监听器
            this.bindEventListeners();
            
            // 每30秒自动刷新数据
            setInterval(() => this.loadDashboardData(), 30000);
            
        } catch (error) {
            console.error('初始化管理面板失败:', error);
            this.showError('初始化失败，请检查您的管理员权限');
        }
    }

    async checkAdminPermission() {
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error || !user) {
            throw new Error('未登录');
        }

        // 检查用户是否有管理员权限
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (profileError || !profile || !['admin', 'super_admin'].includes(profile.role)) {
            throw new Error('权限不足');
        }
    }

    async loadDashboardData() {
        try {
            // 显示加载状态
            this.showLoading(true);
            
            // 并行加载数据
            const [statsResult, usersResult] = await Promise.all([
                this.loadStats(),
                this.loadUsers()
            ]);

            // 更新UI
            this.updateStatsUI();
            this.updateUsersTable();
            
        } catch (error) {
            console.error('加载数据失败:', error);
            this.showError('加载数据失败');
        } finally {
            this.showLoading(false);
        }
    }

    async loadStats() {
        // 获取用户统计信息
        const { data: allUsers, error } = await supabaseAdmin
            .from('profiles')
            .select('status, role, created_at');

        if (error) throw error;

        const now = new Date();
        const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const lastMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        this.stats = {
            total: allUsers.length,
            pending: allUsers.filter(u => u.status === 'pending').length,
            approved: allUsers.filter(u => u.status === 'approved').length,
            rejected: allUsers.filter(u => u.status === 'rejected').length,
            suspended: allUsers.filter(u => u.status === 'suspended').length,
            newThisWeek: allUsers.filter(u => new Date(u.created_at) > lastWeek).length,
            newThisMonth: allUsers.filter(u => new Date(u.created_at) > lastMonth).length,
            admins: allUsers.filter(u => ['admin', 'super_admin'].includes(u.role)).length
        };
    }

    async loadUsers() {
        let query = supabaseAdmin
            .from('profiles')
            .select(`
                id,
                email,
                full_name,
                status,
                role,
                created_at,
                updated_at,
                last_sign_in_at,
                organization,
                phone,
                avatar_url
            `)
            .order('created_at', { ascending: false });

        // 应用筛选器
        if (this.currentFilter !== 'all') {
            query = query.eq('status', this.currentFilter);
        }

        // 应用搜索
        if (this.searchQuery) {
            query = query.or(`email.ilike.%${this.searchQuery}%,full_name.ilike.%${this.searchQuery}%`);
        }

        // 分页
        const from = (this.currentPage - 1) * this.pageSize;
        const to = from + this.pageSize - 1;
        query = query.range(from, to);

        const { data, error, count } = await query;

        if (error) throw error;

        this.users = data || [];
        this.totalCount = count || 0;
    }

    updateStatsUI() {
        // 更新统计卡片
        document.getElementById('total-users').textContent = this.stats.total;
        document.getElementById('pending-users').textContent = this.stats.pending;
        document.getElementById('approved-users').textContent = this.stats.approved;
        document.getElementById('new-this-week').textContent = this.stats.newThisWeek;
        document.getElementById('new-this-month').textContent = this.stats.newThisMonth;
        document.getElementById('admin-users').textContent = this.stats.admins;

        // 更新待审核徽章
        const pendingBadge = document.getElementById('pending-badge');
        if (pendingBadge) {
            pendingBadge.textContent = this.stats.pending;
            pendingBadge.classList.toggle('hidden', this.stats.pending === 0);
        }
    }

    updateUsersTable() {
        const tbody = document.getElementById('users-table-body');
        tbody.innerHTML = '';

        this.users.forEach(user => {
            const row = this.createUserRow(user);
            tbody.appendChild(row);
        });

        // 更新分页信息
        this.updatePagination();
    }

    createUserRow(user) {
        const row = document.createElement('tr');
        row.className = 'border-b border-gray-200 hover:bg-gray-50';
        
        const statusColors = {
            pending: 'bg-yellow-100 text-yellow-800',
            approved: 'bg-green-100 text-green-800',
            rejected: 'bg-red-100 text-red-800',
            suspended: 'bg-gray-100 text-gray-800'
        };

        const roleColors = {
            user: 'bg-blue-100 text-blue-800',
            admin: 'bg-purple-100 text-purple-800',
            super_admin: 'bg-red-100 text-red-800'
        };

        row.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                    <div class="flex-shrink-0 h-10 w-10">
                        <img class="h-10 w-10 rounded-full" src="${user.avatar_url || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user.full_name || user.email)}" alt="">
                    </div>
                    <div class="ml-4">
                        <div class="text-sm font-medium text-gray-900">${user.full_name || '未设置'}</div>
                        <div class="text-sm text-gray-500">${user.email}</div>
                    </div>
                </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusColors[user.status] || 'bg-gray-100 text-gray-800'}">
                    ${this.getStatusText(user.status)}
                </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full ${roleColors[user.role] || 'bg-gray-100 text-gray-800'}">
                    ${this.getRoleText(user.role)}
                </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                ${user.organization || '未设置'}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                ${this.formatDate(user.created_at)}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                ${user.last_sign_in_at ? this.formatDate(user.last_sign_in_at) : '从未登录'}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div class="flex space-x-2">
                    <button onclick="adminDashboard.viewUser('${user.id}')" class="text-indigo-600 hover:text-indigo-900">查看</button>
                    ${user.status === 'pending' ? `
                        <button onclick="adminDashboard.approveUser('${user.id}')" class="text-green-600 hover:text-green-900">通过</button>
                        <button onclick="adminDashboard.rejectUser('${user.id}')" class="text-red-600 hover:text-red-900">拒绝</button>
                    ` : ''}
                    ${user.status === 'approved' ? `
                        <button onclick="adminDashboard.suspendUser('${user.id}')" class="text-yellow-600 hover:text-yellow-900">暂停</button>
                    ` : ''}
                    ${user.status === 'suspended' ? `
                        <button onclick="adminDashboard.approveUser('${user.id}')" class="text-green-600 hover:text-green-900">恢复</button>
                    ` : ''}
                    <button onclick="adminDashboard.editUser('${user.id}')" class="text-blue-600 hover:text-blue-900">编辑</button>
                </div>
            </td>
        `;

        return row;
    }

    getStatusText(status) {
        const statusMap = {
            pending: '待审核',
            approved: '已通过',
            rejected: '已拒绝',
            suspended: '已暂停'
        };
        return statusMap[status] || status;
    }

    getRoleText(role) {
        const roleMap = {
            user: '普通用户',
            admin: '管理员',
            super_admin: '超级管理员'
        };
        return roleMap[role] || role;
    }

    formatDate(dateString) {
        return new Date(dateString).toLocaleString('zh-CN');
    }

    // 用户操作方法
    async approveUser(userId) {
        if (!confirm('确定要通过这个用户吗？')) return;

        try {
            const { error } = await supabaseAdmin
                .from('profiles')
                .update({ 
                    status: 'approved',
                    updated_at: new Date().toISOString()
                })
                .eq('id', userId);

            if (error) throw error;

            this.showSuccess('用户已通过审核');
            await this.loadDashboardData();
        } catch (error) {
            console.error('审核用户失败:', error);
            this.showError('操作失败');
        }
    }

    async rejectUser(userId) {
        const reason = prompt('请输入拒绝原因（可选）:');
        
        try {
            const { error } = await supabaseAdmin
                .from('profiles')
                .update({ 
                    status: 'rejected',
                    rejection_reason: reason,
                    updated_at: new Date().toISOString()
                })
                .eq('id', userId);

            if (error) throw error;

            this.showSuccess('用户已被拒绝');
            await this.loadDashboardData();
        } catch (error) {
            console.error('拒绝用户失败:', error);
            this.showError('操作失败');
        }
    }

    async suspendUser(userId) {
        const reason = prompt('请输入暂停原因:');
        if (!reason) return;

        try {
            const { error } = await supabaseAdmin
                .from('profiles')
                .update({ 
                    status: 'suspended',
                    suspension_reason: reason,
                    updated_at: new Date().toISOString()
                })
                .eq('id', userId);

            if (error) throw error;

            this.showSuccess('用户已被暂停');
            await this.loadDashboardData();
        } catch (error) {
            console.error('暂停用户失败:', error);
            this.showError('操作失败');
        }
    }

    viewUser(userId) {
        const user = this.users.find(u => u.id === userId);
        if (!user) return;

        // 显示用户详情模态框
        this.showUserModal(user);
    }

    editUser(userId) {
        const user = this.users.find(u => u.id === userId);
        if (!user) return;

        // 显示编辑用户模态框
        this.showEditUserModal(user);
    }

    // UI 辅助方法
    showLoading(show) {
        const loader = document.getElementById('loading-overlay');
        if (loader) {
            loader.classList.toggle('hidden', !show);
        }
    }

    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    showNotification(message, type) {
        // 创建通知元素
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 z-50 p-4 rounded-md shadow-lg ${
            type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`;
        notification.textContent = message;

        document.body.appendChild(notification);

        // 3秒后自动移除
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    // 事件监听器
    bindEventListeners() {
        // 搜索功能
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchQuery = e.target.value;
                this.currentPage = 1;
                this.loadDashboardData();
            });
        }

        // 筛选功能
        const filterSelect = document.getElementById('filter-select');
        if (filterSelect) {
            filterSelect.addEventListener('change', (e) => {
                this.currentFilter = e.target.value;
                this.currentPage = 1;
                this.loadDashboardData();
            });
        }

        // 刷新按钮
        const refreshBtn = document.getElementById('refresh-btn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.loadDashboardData());
        }
    }

    updatePagination() {
        const totalPages = Math.ceil(this.totalCount / this.pageSize);
        const paginationContainer = document.getElementById('pagination');
        
        if (!paginationContainer) return;

        paginationContainer.innerHTML = `
            <div class="flex items-center justify-between">
                <div class="text-sm text-gray-700">
                    显示 ${(this.currentPage - 1) * this.pageSize + 1} 到 ${Math.min(this.currentPage * this.pageSize, this.totalCount)} 
                    共 ${this.totalCount} 条记录
                </div>
                <div class="flex space-x-1">
                    <button ${this.currentPage === 1 ? 'disabled' : ''} 
                            onclick="adminDashboard.goToPage(${this.currentPage - 1})"
                            class="px-3 py-1 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                        上一页
                    </button>
                    <span class="px-3 py-1 text-sm">
                        第 ${this.currentPage} 页，共 ${totalPages} 页
                    </span>
                    <button ${this.currentPage === totalPages ? 'disabled' : ''} 
                            onclick="adminDashboard.goToPage(${this.currentPage + 1})"
                            class="px-3 py-1 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                        下一页
                    </button>
                </div>
            </div>
        `;
    }

    goToPage(page) {
        this.currentPage = page;
        this.loadDashboardData();
    }

    showUserModal(user) {
        const modal = document.getElementById('user-modal');
        const modalContent = document.getElementById('user-modal-content');
        
        modalContent.innerHTML = `
            <div class="bg-white px-6 py-4">
                <h3 class="text-lg font-medium text-gray-900 mb-4">用户详情</h3>
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700">姓名</label>
                        <p class="text-sm text-gray-900">${user.full_name || '未设置'}</p>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700">邮箱</label>
                        <p class="text-sm text-gray-900">${user.email}</p>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700">状态</label>
                        <p class="text-sm text-gray-900">${this.getStatusText(user.status)}</p>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700">角色</label>
                        <p class="text-sm text-gray-900">${this.getRoleText(user.role)}</p>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700">组织</label>
                        <p class="text-sm text-gray-900">${user.organization || '未设置'}</p>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700">电话</label>
                        <p class="text-sm text-gray-900">${user.phone || '未设置'}</p>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700">注册时间</label>
                        <p class="text-sm text-gray-900">${this.formatDate(user.created_at)}</p>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700">最后登录</label>
                        <p class="text-sm text-gray-900">${user.last_sign_in_at ? this.formatDate(user.last_sign_in_at) : '从未登录'}</p>
                    </div>
                </div>
                <div class="mt-6 flex justify-end">
                    <button onclick="adminDashboard.closeModal()" class="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400">
                        关闭
                    </button>
                </div>
            </div>
        `;
        
        modal.classList.remove('hidden');
    }

    closeModal() {
        const modal = document.getElementById('user-modal');
        modal.classList.add('hidden');
    }
}

// 全局实例
let adminDashboard;

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    adminDashboard = new AdminDashboard();
});
