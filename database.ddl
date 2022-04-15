CREATE DATABASE IF NOT EXISTS `SquoshyDB`;

CREATE TABLE IF NOT EXISTS SquoshyDB.players (
  username     varchar(255) NOT NULL, 
  password     varchar(255) NOT NULL, 
  currentLevel int(10) NOT NULL, 
  spawnPointX  int(10) NOT NULL,
  spawnPointY  int(10) NOT NULL,
  currentScore  int(10) NOT NULL,
  maxScore     int(10) NOT NULL,
  PRIMARY KEY (username));