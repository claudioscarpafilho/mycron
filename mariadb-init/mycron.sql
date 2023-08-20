SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for jobs
-- ----------------------------
DROP TABLE IF EXISTS `jobs`;
CREATE TABLE `jobs`  (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `cron` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '0 * * * * *',
  `enabled` tinyint(1) NULL DEFAULT 1,
  `status` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'idle',
  `notify` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `nextexecutiontime` datetime NOT NULL DEFAULT current_timestamp(),
  `lastexecutiontime` datetime NULL DEFAULT NULL,
  `lastexecutionstatus` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `retryminutes` smallint(6) NOT NULL DEFAULT 3,
  `retrytimes` smallint(6) NOT NULL DEFAULT 3,
  `attempt` smallint(6) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 4 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of jobs
-- ----------------------------
INSERT INTO `jobs` VALUES (1, 'JobTeste1', '*/10 * * * * *', 1, 'idle', NULL, NOW(), NULL, NULL, 3, 3, 0);
INSERT INTO `jobs` VALUES (2, 'JobTeste2', '*/10 * * * * *', 1, 'idle', NULL, NOW(), NULL, NULL, 3, 3, 0);
INSERT INTO `jobs` VALUES (3, 'JobTeste3', '*/10 * * * * *', 1, 'idle', NULL, NOW(), NULL, NULL, 3, 3, 0);

-- ----------------------------
-- Table structure for log
-- ----------------------------
DROP TABLE IF EXISTS `log`;
CREATE TABLE `log`  (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `job` int(11) NOT NULL,
  `starttime` datetime NOT NULL,
  `endtime` datetime NOT NULL,
  `executiontime` int(11) NOT NULL,
  `executionstatus` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `details` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `attempt` smallint(6) NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `fk_jobs`(`job`) USING BTREE,
  CONSTRAINT `fk_jobs` FOREIGN KEY (`job`) REFERENCES `jobs` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of log
-- ----------------------------

SET FOREIGN_KEY_CHECKS = 1;
