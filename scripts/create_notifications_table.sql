-- Lingola Buddy — kullanıcı bildirim geçmişi (yerel bildirimlerin inbox kaydı)
-- Çalıştır: mysql -u USER -p DB_NAME < scripts/create_notifications_table.sql

CREATE TABLE IF NOT EXISTS notifications (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  client_key VARCHAR(128) NOT NULL COMMENT 'Dedup: {notificationId}_{deliveredAtMs}',
  notification_type VARCHAR(64) NOT NULL DEFAULT 'reminder',
  emoji VARCHAR(16) NOT NULL DEFAULT '🔔',
  title VARCHAR(255) NOT NULL,
  body TEXT NULL,
  delivered_at DATETIME NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_notifications_user_client (user_id, client_key),
  INDEX idx_notifications_user_delivered (user_id, delivered_at DESC),
  CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
