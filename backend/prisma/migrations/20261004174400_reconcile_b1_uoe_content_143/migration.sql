UPDATE `exercises`
SET `correct_answer` = JSON_QUOTE('is of interest to'),
    `explanation_rule` = 'be interested in ⇔ be of interest to; the four-word answer keeps the supplied keyword.'
WHERE `title` = 'B1 Preliminary Use of English Part 4 — Photography club (#3)'
  AND `question_text` = 'Photography ______ Marta.'
  AND JSON_UNQUOTE(`correct_answer`) = 'is of interest to / interests'
  AND `explanation_rule` = 'be interested in ⇔ be of interest to / the verb interest.';

UPDATE `exercises`
SET `question_text` = 'The match ______ the rain.',
    `correct_answer` = JSON_QUOTE('was cancelled because of'),
    `explanation_rule` = 'Use the passive was cancelled and because of + noun; the four-word transformation keeps the original meaning.'
WHERE `title` = 'B1 Preliminary Use of English Part 4 — Cancelled match (#5)'
  AND `question_text` = 'They cancelled the match ______ it was raining.'
  AND JSON_UNQUOTE(`correct_answer`) = 'because'
  AND `explanation_rule` = 'because of + noun ⇔ because + clause.';
