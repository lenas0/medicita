CREATE DATABASE IF NOT EXISTS medicita
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE medicita;


CREATE TABLE users (
  user_id             INT AUTO_INCREMENT PRIMARY KEY,
  user_first_names    VARCHAR(80)  NOT NULL,
  user_last_names     VARCHAR(80)  NOT NULL,
  user_email          VARCHAR(120) NOT NULL UNIQUE,
  user_password_hash  VARCHAR(255) NOT NULL,
  user_role           ENUM('1','2') NOT NULL DEFAULT '2',
  user_phone          VARCHAR(20)
);


CREATE TABLE doctors (
  doctor_id               INT AUTO_INCREMENT PRIMARY KEY,
  doctor_first_names      VARCHAR(80)  NOT NULL,
  doctor_last_names       VARCHAR(80)  NOT NULL,
  doctor_specialty        VARCHAR(80)  NOT NULL,
  doctor_description      TEXT,
  doctor_consultation_fee DECIMAL(10,2) NOT NULL CHECK (doctor_consultation_fee >= 0),
  doctor_active           BOOLEAN NOT NULL DEFAULT TRUE
);


CREATE TABLE doctor_schedules (
  schedule_id           INT AUTO_INCREMENT PRIMARY KEY,
  doctor_id             INT NOT NULL,
  schedule_day_of_week  TINYINT NOT NULL CHECK (schedule_day_of_week BETWEEN 1 AND 5),
  schedule_start_time   TIME NOT NULL,
  schedule_end_time     TIME NOT NULL,
  CHECK (schedule_end_time > schedule_start_time),
  UNIQUE (doctor_id, schedule_day_of_week),
  FOREIGN KEY (doctor_id) REFERENCES doctors(doctor_id)
);


CREATE TABLE appointments (
  appointment_id       INT AUTO_INCREMENT PRIMARY KEY,
  user_id              INT NOT NULL,
  doctor_id            INT NOT NULL,
  appointment_datetime DATETIME NOT NULL,
  appointment_fee      DECIMAL(10,2) NOT NULL CHECK (appointment_fee >= 0),
  appointment_reason   VARCHAR(255),
  appointment_status   ENUM('scheduled','completed','canceled') NOT NULL DEFAULT 'scheduled',
  FOREIGN KEY (user_id) REFERENCES users(user_id),
  FOREIGN KEY (doctor_id)  REFERENCES doctors(doctor_id),
  UNIQUE (doctor_id, appointment_datetime)
);


CREATE TABLE reviews (
  review_id         INT AUTO_INCREMENT PRIMARY KEY,
  appointment_id    INT NOT NULL UNIQUE,
  review_rating     TINYINT NOT NULL CHECK (review_rating BETWEEN 1 AND 5),
  review_comment    VARCHAR(500) NULL,
  review_created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (appointment_id) REFERENCES appointments(appointment_id)
);


CREATE TABLE exams (
  exam_id                    INT AUTO_INCREMENT PRIMARY KEY,
  appointment_id             INT NOT NULL,
  exam_name                  VARCHAR(100) NOT NULL,     
  exam_type                  ENUM('numeric','qualitative','image') NOT NULL,
  exam_date                  DATE NOT NULL,
  exam_value                 DECIMAL(12,4) NULL,
  exam_unit                  VARCHAR(20)   NULL,
  exam_quantitative_result   VARCHAR(255) NULL,
  exam_qualitative_result    ENUM('positive','negative') NULL,
  exam_report                TEXT NULL,
  exam_image_url             VARCHAR(255) NULL,
  FOREIGN KEY (appointment_id) REFERENCES appointments(appointment_id)
);