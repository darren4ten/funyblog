-- 添加站点设置表
CREATE TABLE IF NOT EXISTS site_settings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,    -- 设置ID
  site_title TEXT NOT NULL,                -- 站点标题
  site_subtitle TEXT,                      -- 站点副标题
  footer_main_content TEXT,                -- 页脚主内容
  footer_subtitle TEXT,                    -- 页脚副标题
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,  -- 创建时间
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP   -- 更新时间
);

-- 插入站点设置测试数据
INSERT INTO site_settings (site_title, site_subtitle, footer_main_content, footer_subtitle) VALUES
('我的博客', '分享技术与生活', '© 2025 我的博客. 保留所有权利.', '由 Cloudflare 提供支持');