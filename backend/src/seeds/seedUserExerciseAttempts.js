import { UserExerciseAttempt } from "../models/UserExerciseAttempt.js";
import { User } from "../models/User.js";
import { Exercise } from "../models/Exercise.js";

const attemptsData = [
    // {
    //     id: 1,
    //     user_answer: { "1": "recent", "2": "keen", "3": "made", "4": "stock", "5": "lived", "6": "Otherwise", "7": "occupied", "8": "argued", "9": "towards" },
    //     total_gaps: 9,
    //     correct_gaps: 6,
    //     is_fully_correct: false,
    //     score: 6,
    //     created_at: '2025-12-14 19:12:08',
    //     user_id: 1,
    //     exercise_id: 3
    // },
    // {
    //     id: 2,
    //     user_answer: { "1": "vast", "2": "by", "3": "come across", "4": "little", "5": "case", "6": "except", "7": "aware", "8": "escape", "9": "enables" },
    //     total_gaps: 9,
    //     correct_gaps: 7,
    //     is_fully_correct: false,
    //     score: 7,
    //     created_at: '2025-12-14 19:20:33',
    //     user_id: 1,
    //     exercise_id: 1
    // },
    // {
    //     id: 3,
    //     user_answer: { "1": "recent", "2": "hopeful", "3": "got", "4": "stock", "5": "stayed", "6": "Furthermore", "7": "occupied", "8": "argued", "9": "around" },
    //     total_gaps: 9,
    //     correct_gaps: 2,
    //     is_fully_correct: false,
    //     score: 2,
    //     created_at: '2025-12-14 19:23:03',
    //     user_id: 1,
    //     exercise_id: 3
    // },
    // {
    //     id: 4,
    //     user_answer: { "1": "vast", "2": "with", "3": "come across", "4": "little", "5": "case", "6": "except", "7": "wise", "8": "miss", "9": "lets" },
    //     total_gaps: 9,
    //     correct_gaps: 5,
    //     is_fully_correct: false,
    //     score: 1,
    //     created_at: '2025-12-14 20:48:03',
    //     user_id: 1,
    //     exercise_id: 5
    // },
    // {
    //     id: 5,
    //     user_answer: { "1": "definite", "2": "tend", "3": "indicated", "4": "matter", "5": "manner", "6": "wise", "7": "expose", "8": "style", "9": "treatment" },
    //     total_gaps: 9,
    //     correct_gaps: 4,
    //     is_fully_correct: false,
    //     score: 4,
    //     created_at: '2025-12-14 20:54:10',
    //     user_id: 1,
    //     exercise_id: 4
    // },
    // {
    //     id: 6,
    //     user_answer: { "1": "definite", "2": "consider", "3": "advised", "4": "point", "5": "manner", "6": "aware", "7": "declare", "8": "style", "9": "management" },
    //     total_gaps: 9,
    //     correct_gaps: 2,
    //     is_fully_correct: false,
    //     score: 2,
    //     created_at: '2025-12-14 20:56:33',
    //     user_id: 1,
    //     exercise_id: 4
    // },
    // {
    //     id: 7,
    //     user_answer: { "1": "recent", "2": "glad", "3": "did", "4": "stock", "5": "lived", "6": "Besides", "7": "lived", "8": "defended", "9": "towards" },
    //     total_gaps: 9,
    //     correct_gaps: 3,
    //     is_fully_correct: false,
    //     score: 3,
    //     created_at: '2025-12-14 20:59:46',
    //     user_id: 1,
    //     exercise_id: 3
    // },
    // {
    //     id: 8,
    //     user_answer: { "1": "established", "2": "numbers", "3": "one", "4": "mainly", "5": "far", "6": "usual", "7": "valuable", "8": "constantly", "9": "travel" },
    //     total_gaps: 9,
    //     correct_gaps: 0,
    //     is_fully_correct: false,
    //     score: 0,
    //     created_at: '2025-12-14 21:02:30',
    //     user_id: 1,
    //     exercise_id: 6
    // },
    // {
    //     id: 9,
    //     user_answer: { "1": "recent", "2": "glad", "3": "made", "4": "bank", "5": "remained", "6": "Otherwise", "7": "visited", "8": "defended", "9": "over" },
    //     total_gaps: 9,
    //     correct_gaps: 3,
    //     is_fully_correct: false,
    //     score: 3,
    //     created_at: '2025-12-14 21:05:00',
    //     user_id: 1,
    //     exercise_id: 3
    // },
    // {
    //     id: 10,
    //     user_answer: { "1": "knowledgeable", "2": "fall", "3": "right", "4": "pulled", "5": "event", "6": "adding", "7": "high", "8": "quantity", "9": "advised" },
    //     total_gaps: 9,
    //     correct_gaps: 1,
    //     is_fully_correct: false,
    //     score: 1,
    //     created_at: '2025-12-14 21:07:12',
    //     user_id: 1,
    //     exercise_id: 5
    // },
    // {
    //     id: 11,
    //     user_answer: { "1": "current", "2": "hopeful", "3": "made", "4": "store", "5": "remained", "6": "Besides", "7": "lived", "8": "presented", "9": "over" },
    //     total_gaps: 9,
    //     correct_gaps: 2,
    //     is_fully_correct: false,
    //     score: 2,
    //     created_at: '2025-12-14 21:09:22',
    //     user_id: 1,
    //     exercise_id: 3
    // },
    // {
    //     id: 12,
    //     user_answer: { "1": "vast", "2": "by", "3": "come across", "4": "minimal", "5": "case", "6": "apart", "7": "sensitive", "8": "escape", "9": "authorises" },
    //     total_gaps: 9,
    //     correct_gaps: 5,
    //     is_fully_correct: false,
    //     score: 5,
    //     created_at: '2025-12-14 21:10:29',
    //     user_id: 1,
    //     exercise_id: 1
    // },
    // {
    //     id: 13,
    //     user_answer: { "1": "established", "2": "sizes", "3": "particular", "4": "densely", "5": "homeless", "6": "typical", "7": "valuable", "8": "constantly", "9": "travel" },
    //     total_gaps: 9,
    //     correct_gaps: 1,
    //     is_fully_correct: false,
    //     score: 1,
    //     created_at: '2025-12-14 21:14:44',
    //     user_id: 1,
    //     exercise_id: 6
    // },
    // {
    //     id: 14,
    //     user_answer: { "1": "vast", "2": "by", "3": "come over", "4": "slight", "5": "matter", "6": "beside", "7": "sensitive", "8": "depart", "9": "lets" },
    //     total_gaps: 9,
    //     correct_gaps: 1,
    //     is_fully_correct: false,
    //     score: 1,
    //     created_at: '2025-12-18 16:49:34',
    //     user_id: 1,
    //     exercise_id: 1
    // },
    // {
    //     id: 15,
    //     user_answer: { "1": "vast", "2": "for", "3": "come across", "4": "slight", "5": "matter", "6": "other", "7": "sensitive", "8": "escape", "9": "authorises" },
    //     total_gaps: 9,
    //     correct_gaps: 3,
    //     is_fully_correct: false,
    //     score: 3,
    //     created_at: '2025-12-20 18:40:42',
    //     user_id: 1,
    //     exercise_id: 1
    // },
    // {
    //     id: 16,
    //     user_answer: { "1": "change", "2": "all", "3": "increased", "4": "demand", "5": "ingredients", "6": "little", "7": "definite", "8": "introductory", "9": "region" },
    //     total_gaps: 9,
    //     correct_gaps: 1,
    //     is_fully_correct: false,
    //     score: 1,
    //     created_at: '2025-12-20 18:45:51',
    //     user_id: 1,
    //     exercise_id: 2
    // },
    // {
    //     id: 17,
    //     user_answer: { "1": "recent", "2": "hopeful", "3": "made", "4": "bank", "5": "stayed", "6": "Furthermore", "7": "occupied", "8": "challenged", "9": "around" },
    //     total_gaps: 9,
    //     correct_gaps: 2,
    //     is_fully_correct: false,
    //     score: 2,
    //     created_at: '2025-12-20 18:52:35',
    //     user_id: 1,
    //     exercise_id: 3
    // },
    // {
    //     id: 18,
    //     user_answer: { "1": "knowledgeable", "2": "decline", "3": "actual", "4": "attracted", "5": "act", "6": "increasing", "7": "good", "8": "quantity", "9": "advised" },
    //     total_gaps: 9,
    //     correct_gaps: 3,
    //     is_fully_correct: false,
    //     score: 3,
    //     created_at: '2025-12-20 18:53:18',
    //     user_id: 1,
    //     exercise_id: 5
    // },
    // {
    //     id: 19,
    //     user_answer: { "1": "established", "2": "numbers", "3": "individual", "4": "largely", "5": "remote", "6": "usual", "7": "valuable", "8": "constantly", "9": "travel" },
    //     total_gaps: 9,
    //     correct_gaps: 1,
    //     is_fully_correct: false,
    //     score: 1,
    //     created_at: '2025-12-20 19:11:42',
    //     user_id: 1,
    //     exercise_id: 6
    // },
    // {
    //     id: 20,
    //     user_answer: { "1": "recent", "2": "interested", "3": "made", "4": "supply", "5": "occupied", "6": "Otherwise", "7": "lived", "8": "argued", "9": "towards" },
    //     total_gaps: 9,
    //     correct_gaps: 8,
    //     is_fully_correct: false,
    //     score: 8,
    //     created_at: '2025-12-21 15:19:46',
    //     user_id: 1,
    //     exercise_id: 3
    // },
    // {
    //     id: 21,
    //     user_answer: { "1": "definite", "2": "tend", "3": "indicated", "4": "case", "5": "action", "6": "aware", "7": "confirm", "8": "characteristic", "9": "treatment" },
    //     total_gaps: 9,
    //     correct_gaps: 7,
    //     is_fully_correct: false,
    //     score: 7,
    //     created_at: '2025-12-24 17:02:37',
    //     user_id: 1,
    //     exercise_id: 4
    // },
    // {
    //     id: 22,
    //     user_answer: { "1": "change", "2": "all", "3": "grown-up", "4": "supervise", "5": "ingredients", "6": "low", "7": "sure", "8": "basic", "9": "environment" },
    //     total_gaps: 9,
    //     correct_gaps: 7,
    //     is_fully_correct: false,
    //     score: 7,
    //     created_at: '2025-12-25 10:09:13',
    //     user_id: 1,
    //     exercise_id: 2
    // },
    // {
    //     id: 23,
    //     user_answer: { "1": "recent", "2": "glad", "3": "did", "4": "stock", "5": "lived", "6": "Beyond", "7": "occupied", "8": "argued", "9": "towards" },
    //     total_gaps: 9,
    //     correct_gaps: 3,
    //     is_fully_correct: false,
    //     score: 3,
    //     created_at: '2025-12-25 10:16:23',
    //     user_id: 1,
    //     exercise_id: 3
    // },
    // {
    //     id: 24,
    //     user_answer: { "1": "change", "2": "all", "3": "grown-up", "4": "command", "5": "ingredients", "6": "little", "7": "sure", "8": "easy", "9": "region" },
    //     total_gaps: 9,
    //     correct_gaps: 3,
    //     is_fully_correct: false,
    //     score: 3,
    //     created_at: '2025-12-25 10:22:35',
    //     user_id: 1,
    //     exercise_id: 2
    // },
    // {
    //     id: 25,
    //     user_answer: { "1": "definite", "2": "regard", "3": "indicated", "4": "point", "5": "behaviour", "6": "clear", "7": "demonstrate", "8": "personality", "9": "treatment" },
    //     total_gaps: 9,
    //     correct_gaps: 5,
    //     is_fully_correct: false,
    //     score: 5,
    //     created_at: '2025-12-25 10:34:06',
    //     user_id: 1,
    //     exercise_id: 4
    // },
    // {
    //     id: 26,
    //     user_answer: { "1": "vast", "2": "by", "3": "come over", "4": "slight", "5": "case", "6": "apart", "7": "aware", "8": "escape", "9": "makes" },
    //     total_gaps: 9,
    //     correct_gaps: 5,
    //     is_fully_correct: false,
    //     score: 5,
    //     created_at: '2025-12-25 10:36:37',
    //     user_id: 1,
    //     exercise_id: 1
    // },
    // {
    //     id: 27,
    //     user_answer: { "1": "definite", "2": "tend", "3": "indicated", "4": "point", "5": "behaviour", "6": "aware", "7": "demonstrate", "8": "personality", "9": "management" },
    //     total_gaps: 9,
    //     correct_gaps: 6,
    //     is_fully_correct: false,
    //     score: 6,
    //     created_at: '2025-12-25 10:43:22',
    //     user_id: 1,
    //     exercise_id: 4
    // },
    // {
    //     id: 28,
    //     user_answer: { "1": "definite", "2": "consider", "3": "advised", "4": "case", "5": "behaviour", "6": "wise", "7": "expose", "8": "style", "9": "management" },
    //     total_gaps: 9,
    //     correct_gaps: 3,
    //     is_fully_correct: false,
    //     score: 3,
    //     created_at: '2025-12-25 16:43:06',
    //     user_id: 1,
    //     exercise_id: 4
    // },
    // {
    //     id: 29,
    //     user_answer: { "1": "wide", "2": "with", "3": "come over", "4": "little", "5": "point", "6": "other", "7": "wise", "8": "miss", "9": "lets" },
    //     total_gaps: 9,
    //     correct_gaps: 2,
    //     is_fully_correct: false,
    //     score: 2,
    //     created_at: '2025-12-25 16:43:43',
    //     user_id: 1,
    //     exercise_id: 1
    // },
    // {
    //     id: 30,
    //     user_answer: { "1": "vast", "2": "on", "3": "come over", "4": "minimal", "5": "issue", "6": "except", "7": "sensitive", "8": "depart", "9": "enables" },
    //     total_gaps: 9,
    //     correct_gaps: 2,
    //     is_fully_correct: false,
    //     score: 2,
    //     created_at: '2025-12-25 17:33:45',
    //     user_id: 1,
    //     exercise_id: 1
    // },
    // {
    //     id: 31,
    //     user_answer: { "1": "vast", "2": "for", "3": "come across", "4": "slight", "5": "issue", "6": "other", "7": "wise", "8": "break", "9": "enables" },
    //     total_gaps: 9,
    //     correct_gaps: 3,
    //     is_fully_correct: false,
    //     score: 3,
    //     created_at: '2025-12-26 10:26:00',
    //     user_id: 1,
    //     exercise_id: 1
    // }
];

export const seedUserExerciseAttempts = async () => {
    const user = await User.findByPk(1);
    if (!user) {
        console.log("User with id 1 not found. Please run seedUsers first.");
        return;
    }

    for (const data of attemptsData) {
        const exercise = await Exercise.findByPk(data.exercise_id);
        if (!exercise) {
            console.log(`Exercise with id ${data.exercise_id} not found. Skipping attempt ${data.id}.`);
            continue;
        }

        await UserExerciseAttempt.findOrCreate({
            where: { id: data.id },
            defaults: {
                user_answer: data.user_answer,
                total_gaps: data.total_gaps,
                correct_gaps: data.correct_gaps,
                is_fully_correct: data.is_fully_correct,
                score: data.score,
                created_at: data.created_at,
                user_id: data.user_id,
                exercise_id: data.exercise_id
            }
        });
    }

    console.log(`Successfully seeded ${attemptsData.length} user exercise attempts.`);
};
