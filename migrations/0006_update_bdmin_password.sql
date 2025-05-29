-- 更新bdmin用户的密码哈希值
UPDATE users 
SET password_hash = 'c8db873e74c4c80d1ef763dc405ddbcfe82589b1de3f873a433102463f586c7c' 
WHERE username = 'bdmin';