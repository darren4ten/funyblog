-- 添加测试评论
INSERT INTO comments (post_id, author_name, author_email, content, status, ip_address, user_agent) VALUES
(1, 'visitor1', 'visitor1@example.com', '很棒的博客，期待更多内容！', 'approved', '127.0.0.1', 'Mozilla/5.0'),
(2, 'learner', 'learner@example.com', '学到了很多，谢谢！', 'approved', '127.0.0.1', 'Mozilla/5.0'),
(2, 'tech_fan', 'tech_fan@example.com', 'Markdown 真是太有用了！', 'approved', '127.0.0.1', 'Mozilla/5.0');