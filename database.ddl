DROP DATABASE IF EXISTS `SquoshyDB`;
CREATE DATABASE `SquoshyDB`;

DROP TABLE IF EXISTS SquoshyDB.players;
CREATE TABLE SquoshyDB.players (
  username     varchar(255) NOT NULL, 
  password     varchar(255) NOT NULL, 
  currentLevel int(10) NOT NULL, 
  spawnPointX  int(10) NOT NULL,
  spawnPointY  int(10) NOT NULL,
  currentScore  int(10),
  maxScore     int(10),
  PRIMARY KEY (username));