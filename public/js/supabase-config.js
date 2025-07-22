// Supabase客户端配置
// 注意：这是浏览器环境的配置，不使用ES6 import

// 从环境变量或直接配置获取Supabase连接信息
const supabaseUrl = 'https://ekhaaixtqblwlizvvugp.supabase.co'
const supabaseAnonKey = ''
const supabaseServiceKey = '' // 管理页面需要服务角色密钥

// 创建客户端实例（用于普通操作）
const supabase = supabase.createClient(supabaseUrl, supabaseAnonKey)

// 创建管理员客户端实例（用于管理操作，绕过RLS）
const supabaseAdmin = supabase.createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// 用户状态枚举
const USER_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved', 
  REJECTED: 'rejected',
  SUSPENDED: 'suspended'
}

// 用户角色枚举
const USER_ROLES = {
  USER: 'user',
  ADMIN: 'admin',
  SUPER_ADMIN: 'super_admin'
}
