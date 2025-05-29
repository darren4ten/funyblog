-- 由于 D1 不支持直接重命名列，我们需要创建一个新列并迁移数据
ALTER TABLE posts ADD COLUMN summary TEXT CHECK (LENGTH(summary) <= 300);

-- 将 excerpt 数据迁移到 summary 列
UPDATE posts SET summary = excerpt;

-- 删除旧的 excerpt 列
-- 注意：D1 目前不支持 DROP COLUMN 操作，因此我们暂时保留 excerpt 列
-- 在未来支持 DROP COLUMN 时，可以执行以下操作：
-- ALTER TABLE posts DROP COLUMN excerpt;