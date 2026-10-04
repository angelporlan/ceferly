ALTER TABLE `user_exercise_attempts`
ADD COLUMN `grading_status` VARCHAR(24) NOT NULL DEFAULT 'graded';

UPDATE `user_exercise_attempts` AS uea
INNER JOIN `exercises` AS ex ON ex.`id` = uea.`exercise_id`
LEFT JOIN `attempt_explanations` AS ae ON ae.`attempt_id` = uea.`id`
SET uea.`grading_status` = CASE
    WHEN ae.`id` IS NULL THEN 'pending_feedback'
    ELSE 'feedback_available'
END
WHERE LOWER(ex.`type`) IN ('essay', 'writing');
