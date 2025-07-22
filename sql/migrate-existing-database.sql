-- =====================================================
-- MED环境数据平台 - 数据库迁移脚本
-- 从现有profiles表升级到管理系统兼容格式
-- =====================================================

-- 1. 备份现有数据（可选，但推荐）
-- CREATE TABLE profiles_backup AS SELECT * FROM profiles;

-- 2. 添加管理系统需要的新字段
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS username TEXT,
ADD COLUMN IF NOT EXISTS full_name TEXT,
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user',
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS last_login TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS department TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT;

-- 3. 添加约束检查
ALTER TABLE profiles 
DROP CONSTRAINT IF EXISTS profiles_role_check,
ADD CONSTRAINT profiles_role_check CHECK (role IN ('user', 'admin', 'super_admin'));

ALTER TABLE profiles 
DROP CONSTRAINT IF EXISTS profiles_status_check,
ADD CONSTRAINT profiles_status_check CHECK (status IN ('pending', 'approved', 'rejected', 'suspended'));

-- 4. 迁移现有数据
-- 将现有的 approved 字段映射到新的 status 字段
UPDATE profiles 
SET status = CASE 
    WHEN approved = true THEN 'approved'
    WHEN approved = false THEN 'pending'
    ELSE 'pending'
END
WHERE status IS NULL OR status = 'pending';

-- 根据email生成username（如果为空）
UPDATE profiles 
SET username = split_part(email, '@', 1)
WHERE username IS NULL;

-- 根据organization生成full_name（如果为空）
UPDATE profiles 
SET full_name = COALESCE(organization, split_part(email, '@', 1))
WHERE full_name IS NULL;

-- 5. 创建活动日志表（如果不存在）
CREATE TABLE IF NOT EXISTS activity_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    admin_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    target_user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. 启用activity_logs的RLS
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- 7. 更新RLS策略以支持管理员权限
-- 删除可能冲突的旧策略
DROP POLICY IF EXISTS "管理员可以查看所有profiles" ON profiles;
DROP POLICY IF EXISTS "管理员可以更新所有profiles" ON profiles;

-- 创建新的管理员策略
CREATE POLICY "管理员可以查看所有profiles" ON profiles
    FOR SELECT USING (
        auth.uid() = id OR -- 用户可以查看自己
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'super_admin')
        )
    );

CREATE POLICY "管理员可以更新所有profiles" ON profiles
    FOR UPDATE USING (
        auth.uid() = id OR -- 用户可以更新自己
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'super_admin')
        )
    );

-- 8. 创建activity_logs的RLS策略
CREATE POLICY "管理员可以查看所有日志" ON activity_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'super_admin')
        )
    );

CREATE POLICY "管理员可以插入日志" ON activity_logs
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'super_admin')
        )
    );

-- 9. 更新现有的触发器函数以支持新字段
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (
        id, 
        email, 
        username,
        full_name,
        organization, 
        org_type, 
        country, 
        is_edu_email, 
        approved,
        status,
        role
    )
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'organization', split_part(NEW.email, '@', 1)),
        NEW.raw_user_meta_data->>'organization',
        NEW.raw_user_meta_data->>'orgType',
        NEW.raw_user_meta_data->>'country',
        (NEW.raw_user_meta_data->>'isEduEmail')::boolean,
        (NEW.raw_user_meta_data->>'approved')::boolean,
        CASE 
            WHEN (NEW.raw_user_meta_data->>'approved')::boolean = true THEN 'approved'
            ELSE 'pending'
        END,
        'user' -- 新用户默认为普通用户
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. 创建更新时间触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为profiles表创建更新触发器（如果不存在）
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at 
    BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- 11. 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_status ON profiles(status);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at);

-- 12. 创建用于管理面板的视图
CREATE OR REPLACE VIEW admin_user_stats AS
SELECT 
    COUNT(*) as total_users,
    COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_users,
    COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved_users,
    COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected_users,
    COUNT(CASE WHEN status = 'suspended' THEN 1 END) as suspended_users,
    COUNT(CASE WHEN role = 'admin' OR role = 'super_admin' THEN 1 END) as admin_users,
    COUNT(CASE WHEN created_at >= NOW() - INTERVAL '24 hours' THEN 1 END) as new_users_today,
    COUNT(CASE WHEN created_at >= NOW() - INTERVAL '7 days' THEN 1 END) as new_users_week
FROM profiles;

-- =====================================================
-- 迁移完成！
-- =====================================================

-- 验证迁移结果
SELECT 
    'Migration completed successfully!' as status,
    COUNT(*) as total_users,
    COUNT(CASE WHEN role IS NOT NULL THEN 1 END) as users_with_role,
    COUNT(CASE WHEN status IS NOT NULL THEN 1 END) as users_with_status
FROM profiles;
