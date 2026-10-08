CREATE TABLE `admin_login_limit` (
	`id` text PRIMARY KEY NOT NULL,
	`attempts` integer NOT NULL,
	`reset_at` integer NOT NULL
);
--> statement-breakpoint
INSERT OR IGNORE INTO rewards(node,amount,name) VALUES
 (3,100,'启程的礼物'),(5,150,'草原宝箱'),(10,200,'森林宝箱'),
 (15,250,'遗迹宝箱'),(20,350,'雪山宝箱'),(25,450,'传说宝箱');
--> statement-breakpoint
INSERT INTO letters(id,node,title,body,published)
 SELECT 'welcome-' || node,node,name || ' · 给勇者的信',
 '亲爱的画笔勇者：' || char(10) || char(10) ||
 '谢谢你为这个世界留下第 ' || node || ' 份色彩。每一次尝试，都值得被好好珍藏。' || char(10) || char(10) ||
 '不必着急，也不必和任何人比较。无论过去多久，这片世界都欢迎你回来。' || char(10) || char(10) ||
 '—— 一直为你加油的人',1
 FROM rewards WHERE NOT EXISTS (SELECT 1 FROM letters);
--> statement-breakpoint
UPDATE rewards SET unlocked_at=strftime('%Y-%m-%dT%H:%M:%fZ','now')
 WHERE unlocked_at IS NULL AND node <= (SELECT COUNT(*) FROM artworks);
