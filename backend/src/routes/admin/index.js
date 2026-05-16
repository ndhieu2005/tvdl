const router = require('express').Router();
const auth = require('../../middleware/auth');

router.use('/auth', require('./auth'));
router.use('/sync', auth, require('./sync'));
router.use('/new-books', auth, require('./newBooks'));
router.use('/schedules', auth, require('./schedules'));
router.use('/suggestions', auth, require('./suggestions'));

module.exports = router;
