DROP TABLE IF EXISTS `users`;



-- wete2_cms.users определение

CREATE TABLE `users` (
                         `id` int NOT NULL AUTO_INCREMENT,
                         `username` varchar(100) NOT NULL,
                         `password` varchar(100) NOT NULL,
                         `roles` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
                         PRIMARY KEY (`id`),
                         UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;



INSERT INTO wete2_cms.users
(id, username, password, roles)
VALUES(0, 'admin', '7732d7744e01123bbe9380e937cc36ca5a8b9335799f543efadebc388486e4c6', 'user,admin'),
      (0, 'user', '7732d7744e01123bbe9380e937cc36ca5a8b9335799f543efadebc388486e4c6', 'user');




-- wete2_cms.posts определение
DROP TABLE IF EXISTS `posts`;
CREATE TABLE `posts` (
                         `id` int NOT NULL AUTO_INCREMENT,
                         `user_id` int NOT NULL,
                         `created_at` datetime NOT NULL,
                         `nazov` text NOT NULL,
                         `popis` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
                         `mesto` varchar(40) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
                         `date` datetime DEFAULT CURRENT_TIMESTAMP,
                         `typ` enum('Veľtrh','Výstava','Festival','') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
                         `region` enum('Bratislavský kraj','Nitriansky kraj','Trenčiansky kraj','') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
                         `image_path` varchar(100) DEFAULT NULL,
                         PRIMARY KEY (`id`),
                         KEY `user` (`user_id`),
                         KEY `created_at` (`created_at`),
                         CONSTRAINT `posts_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=40 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;



-- wete2_cms.comments определение
DROP TABLE IF EXISTS `comments`;
CREATE TABLE `comments` (
                            `comment_id` int NOT NULL AUTO_INCREMENT,
                            `post_id` int NOT NULL,
                            `user_id` int NOT NULL,
                            `comment_text` text COLLATE utf8mb4_unicode_ci,
                            `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
                            PRIMARY KEY (`comment_id`),
                            KEY `post_id` (`post_id`),
                            KEY `user_id` (`user_id`),
                            CONSTRAINT `comments_ibfk_1` FOREIGN KEY (`post_id`) REFERENCES `posts` (`id`) ON DELETE CASCADE,
                            CONSTRAINT `comments_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
