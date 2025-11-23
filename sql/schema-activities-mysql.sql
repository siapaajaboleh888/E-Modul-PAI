-- Schema MySQL untuk modul ujian/aktivitas E-Modul PAI
-- Jalankan file ini di database MySQL (misalnya `emodul_pai`) melalui TablePlus.

CREATE TABLE IF NOT EXISTS activities (
  id INT AUTO_INCREMENT PRIMARY KEY,
  unit_id INT NOT NULL,
  type ENUM('QUIZ','TASK') NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  due_date DATETIME NULL,
  max_score INT NULL,
  created_by INT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_activities_unit FOREIGN KEY (unit_id) REFERENCES units(id) ON DELETE CASCADE,
  CONSTRAINT fk_activities_creator FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS questions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  activity_id INT NOT NULL,
  question_text TEXT NOT NULL,
  question_type ENUM('MCQ') NOT NULL DEFAULT 'MCQ',
  options_json TEXT,
  answer_key VARCHAR(255),
  ordering INT,
  CONSTRAINT fk_questions_activity FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS activity_attempts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  activity_id INT NOT NULL,
  student_id INT NOT NULL,
  score INT NULL,
  answers_json TEXT,
  submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_attempts_activity FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE CASCADE,
  CONSTRAINT fk_attempts_student FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS task_submissions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  activity_id INT NOT NULL,
  student_id INT NOT NULL,
  answer_text TEXT,
  score INT NULL,
  feedback TEXT,
  graded_by INT NULL,
  submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  graded_at DATETIME NULL,
  CONSTRAINT fk_tasks_activity FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE CASCADE,
  CONSTRAINT fk_tasks_student FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_tasks_grader FOREIGN KEY (graded_by) REFERENCES users(id) ON DELETE SET NULL
);
