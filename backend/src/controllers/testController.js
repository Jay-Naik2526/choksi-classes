const Test = require('../models/Test');
const Question = require('../models/Question');
const Attempt = require('../models/Attempt');
const User = require('../models/User');

// GET /api/tests
exports.getTests = async (req, res) => {
    try {
        const { role, _id } = req.user;
        const { status, upcoming } = req.query;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const skip = (page - 1) * limit;
        const filter = {};

        if (role === 'sir') {
            if (status) filter.status = status;
        } else if (role === 'parent') {
            const studentId = req.query.studentId;
            if (!studentId) {
                return res.status(400).json({ message: 'studentId query parameter required' });
            }
            const parent = await User.findById(_id).lean();
            const isChild = parent.childIds?.some(cid => cid.toString() === studentId);
            if (!isChild) {
                return res.status(403).json({ message: 'Access denied: student is not linked to this parent' });
            }

            filter.status = { $in: ['published', 'active', 'completed', 'results_released'] };
            const studentDoc = await User.findById(studentId).select('batchIds').lean();
            filter.$or = [
                { batchId: { $exists: false } },
                { batchId: null },
                { batchId: { $in: studentDoc?.batchIds || [] } },
            ];
        } else {
            filter.status = { $in: ['published', 'active', 'completed', 'results_released'] };
            const studentDoc = await User.findById(_id).select('batchIds').lean();
            filter.$or = [
                { batchId: { $exists: false } },
                { batchId: null },
                { batchId: { $in: studentDoc?.batchIds || [] } },
            ];
        }

        if (upcoming === 'true') filter.date = { $gte: new Date() };

        const total = await Test.countDocuments(filter);
        const tests = await Test.find(filter)
            .sort({ date: 1 })
            .skip(skip)
            .limit(limit)
            .populate('batchId', 'name subject')
            .populate('createdBy', 'name')
            .lean();

        if (role === 'student' || role === 'parent') {
            const targetStudentId = role === 'parent' ? req.query.studentId : _id;
            const attempts = await Attempt.find({ studentId: targetStudentId }).select('testId status score percentage').lean();
            const attemptMap = {};
            attempts.forEach(a => { attemptMap[a.testId.toString()] = a; });
            const testsWithAttempt = tests.map(t => ({
                ...t,
                attempt: attemptMap[t._id.toString()] || null,
            }));
            return res.json({
                tests: testsWithAttempt,
                pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
            });
        }

        res.json({
            tests,
            pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
        });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

// GET /api/tests/:id
exports.getTest = async (req, res) => {
    try {
        const test = await Test.findById(req.params.id)
            .populate('questions')
            .populate('batchId', 'name')
            .populate('createdBy', 'name');
        if (!test) return res.status(404).json({ message: 'Test not found' });

        if (req.user.role === 'student') {
            // FIX #5: Block student from re-opening a test they already submitted
            const Attempt = require('../models/Attempt');
            const existing = await Attempt.findOne({ studentId: req.user._id, testId: test._id });
            if (existing && existing.status !== 'in_progress') {
                return res.status(400).json({ message: 'Already submitted' });
            }

            const testObj = test.toObject();
            testObj.questions = testObj.questions.map(q => {
                const { correctAnswer, ...rest } = q;
                return rest;
            });
            return res.json({ test: testObj });
        }

        res.json({ test });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

// POST /api/tests — Sir: create test
exports.createTest = async (req, res) => {
    try {
        let { name, subject, batchId, date, duration, totalMarks, instructions, questions } = req.body;
        if (!name || !subject || !date || !duration)
            return res.status(400).json({ message: 'Required fields missing' });

        const parsedTotalMarks = parseInt(totalMarks) || (questions?.reduce((sum, q) => sum + (parseInt(q.marks) || 0), 0)) || 0;
        if (!parsedTotalMarks) {
            return res.status(400).json({ message: 'Total marks must be greater than 0' });
        }

        const createdQuestions = [];
        if (questions?.length) {
            for (const q of questions) {
                // FIX #6: Assign test subject to each question so bank filtering works
                const question = await Question.create({
                    ...q,
                    subject: q.subject || subject,
                    createdBy: req.user._id,
                });
                createdQuestions.push(question._id);
            }
        }

        const test = await Test.create({
            name, subject,
            ...(batchId ? { batchId } : {}),
            date, duration, totalMarks: parsedTotalMarks, instructions,
            questions: createdQuestions,
            createdBy: req.user._id,
        });

        res.status(201).json({ test });
    } catch (err) {
        res.status(500).json({ message: 'Server error: ' + err.message });
    }
};

// PUT /api/tests/:id — Sir: update test
exports.updateTest = async (req, res) => {
    try {
        const test = await Test.findOne({ _id: req.params.id, createdBy: req.user._id });
        if (!test) return res.status(404).json({ message: 'Test not found' });

        const { name, subject, batchId, date, duration, totalMarks, instructions, status } = req.body;
        if (name) test.name = name;
        if (subject) test.subject = subject;
        if (batchId) test.batchId = batchId;
        if (date) test.date = date;
        if (duration) test.duration = duration;
        if (totalMarks) test.totalMarks = totalMarks;
        if (instructions) test.instructions = instructions;
        if (status) test.status = status;
        await test.save();

        res.json({ test });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

// POST /api/tests/:id/questions — add question to existing test
exports.addQuestion = async (req, res) => {
    try {
        const test = await Test.findOne({ _id: req.params.id, createdBy: req.user._id });
        if (!test) return res.status(404).json({ message: 'Test not found' });
        const question = await Question.create({ ...req.body, createdBy: req.user._id });
        test.questions.push(question._id);
        await test.save();
        res.status(201).json({ question });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

// DELETE /api/tests/:id/questions/:qid
exports.removeQuestion = async (req, res) => {
    try {
        const test = await Test.findOne({ _id: req.params.id, createdBy: req.user._id });
        if (!test) return res.status(404).json({ message: 'Test not found' });
        test.questions = test.questions.filter(q => q.toString() !== req.params.qid);
        await test.save();
        await Question.findByIdAndDelete(req.params.qid);
        res.json({ message: 'Question removed' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

// POST /api/tests/:id/attempt — Student: start/submit attempt
exports.submitAttempt = async (req, res) => {
    try {
        const test = await Test.findById(req.params.id).populate('questions');
        if (!test) return res.status(404).json({ message: 'Test not found' });
        if (!['published', 'active'].includes(test.status))
            return res.status(400).json({ message: 'Test not available' });

        const existing = await Attempt.findOne({ studentId: req.user._id, testId: test._id });
        if (existing && existing.status !== 'in_progress')
            return res.status(400).json({ message: 'Already submitted' });

        const { answers, timeTaken } = req.body;

        let score = 0;
        const gradedAnswers = answers.map(ans => {
            const question = test.questions.find(q => q._id.toString() === ans.questionId);
            if (!question) return ans;
            let isCorrect = false;
            let marksAwarded = 0;
            if (question.type === 'mcq' && question.correctAnswer === ans.selectedOption) {
                isCorrect = true;
                marksAwarded = question.marks;
                score += marksAwarded;
            }
            return { ...ans, isCorrect, marksAwarded };
        });

        const percentage = Math.round((score / test.totalMarks) * 100);

        let attempt;
        if (existing) {
            existing.answers = gradedAnswers;
            existing.score = score;
            existing.percentage = percentage;
            existing.status = 'submitted';
            existing.submittedAt = new Date();
            existing.timeTaken = timeTaken;
            await existing.save();
            attempt = existing;
        } else {
            attempt = await Attempt.create({
                studentId: req.user._id,
                testId: test._id,
                answers: gradedAnswers,
                score, percentage,
                status: 'submitted',
                submittedAt: new Date(),
                timeTaken,
            });
        }

        res.json({ attempt: { score, percentage, totalMarks: test.totalMarks } });
    } catch (err) {
        res.status(500).json({ message: 'Server error: ' + err.message });
    }
};

// GET /api/tests/:id/results — Sir: all results; Student: own result (after release)
exports.getResults = async (req, res) => {
    try {
        const test = await Test.findById(req.params.id);
        if (!test) return res.status(404).json({ message: 'Test not found' });

        if (req.user.role === 'student') {
            if (test.status !== 'results_released')
                return res.status(400).json({ message: 'Results not yet released' });
            const attempt = await Attempt.findOne({ studentId: req.user._id, testId: test._id })
                .populate({ path: 'answers.questionId', select: 'text options correctAnswer marks type' });
            if (!attempt) return res.status(404).json({ message: 'No attempt found' });
            return res.json({ attempt, test });
        }

        if (req.user.role === 'parent') {
            const studentId = req.query.studentId;
            if (!studentId) {
                return res.status(400).json({ message: 'studentId query parameter required' });
            }
            const parent = await User.findById(req.user._id);
            const isChild = parent.childIds?.some(cid => cid.toString() === studentId);
            if (!isChild) {
                return res.status(403).json({ message: 'Access denied: student is not linked to this parent' });
            }

            if (test.status !== 'results_released')
                return res.status(400).json({ message: 'Results not yet released' });

            const attempt = await Attempt.findOne({ studentId, testId: test._id })
                .populate({ path: 'answers.questionId', select: 'text options correctAnswer marks type' });
            if (!attempt) return res.status(404).json({ message: 'No attempt found' });
            return res.json({ attempt, test });
        }

        const attempts = await Attempt.find({ testId: test._id, status: { $in: ['submitted', 'graded'] } })
            .populate('studentId', 'name rollNumber')
            .populate({ path: 'answers.questionId', select: 'text options correctAnswer marks type' })
            .sort({ score: -1 });

        const classAvg = attempts.length
            ? Math.round(attempts.reduce((s, a) => s + a.percentage, 0) / attempts.length)
            : 0;

        res.json({ attempts, classAvg, totalMarks: test.totalMarks, test: { name: test.name, subject: test.subject } });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

// PATCH /api/tests/:id/release — Sir: release results
exports.releaseResults = async (req, res) => {
    try {
        const test = await Test.findOne({ _id: req.params.id, createdBy: req.user._id });
        if (!test) return res.status(404).json({ message: 'Test not found' });
        test.status = 'results_released';
        test.resultsReleasedAt = new Date();
        await test.save();
        res.json({ message: 'Results released' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

// PATCH /api/tests/:id/grade — Sir: manually grade subjective
exports.gradeAttempt = async (req, res) => {
    try {
        const { attemptId, questionId, marksAwarded } = req.body;
        const attempt = await Attempt.findById(attemptId);
        if (!attempt) return res.status(404).json({ message: 'Attempt not found' });

        const answerIndex = attempt.answers.findIndex(a => a.questionId?.toString() === questionId);
        if (answerIndex === -1) return res.status(404).json({ message: 'Answer not found' });

        const oldMarks = attempt.answers[answerIndex].marksAwarded || 0;
        attempt.answers[answerIndex].marksAwarded = marksAwarded;
        attempt.score = attempt.score - oldMarks + marksAwarded;

        const test = await Test.findById(attempt.testId);
        attempt.percentage = Math.round((attempt.score / test.totalMarks) * 100);
        attempt.status = 'graded';
        await attempt.save();

        res.json({ message: 'Graded', score: attempt.score, percentage: attempt.percentage });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

// GET /api/tests/question-bank — Sir: question bank
exports.getQuestionBank = async (req, res) => {
    try {
        const { subject, chapter, difficulty, type, search } = req.query;
        const filter = {};
        if (subject) filter.subject = subject;
        if (chapter) filter.chapter = chapter;
        if (difficulty) filter.difficulty = difficulty;
        if (type) filter.type = type;
        if (search) filter.text = new RegExp(search, 'i');
        const questions = await Question.find(filter).sort({ createdAt: -1 });
        res.json({ questions });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

// DELETE /api/tests/questions/:id — Sir: delete a question from bank
exports.deleteQuestion = async (req, res) => {
    try {
        await Question.findByIdAndDelete(req.params.id);
        res.json({ message: 'Question deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};
