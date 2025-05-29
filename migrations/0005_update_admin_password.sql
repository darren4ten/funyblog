-- 更新管理员用户的密码哈希值
UPDATE users 
SET password_hash = 'a948904f2f0f479b8f8197694b30184b0d2ed1c1cd2a1ec0fb85d299a192a447' 
WHERE username = 'admin';