const router = require('express').Router();
const auth = require('../../middleware/auth');

router.use('/auth', require('./auth'));
router.use('/new-books', auth, require('./newBooks'));
router.use('/schedules', auth, require('./schedules'));
router.use('/schedule-templates', auth, require('./scheduleTemplates'));
router.use('/suggestions', auth, require('./suggestions'));
router.use('/uploads', auth, require('./uploads'));
router.use('/events', auth, require('./events'));
router.use('/posts', auth, require('./posts'));

module.exports = router;
