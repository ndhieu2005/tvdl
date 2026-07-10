const router = require('express').Router();

router.use('/books', require('./books'));
router.use('/schedules', require('./schedules'));
router.use('/new-books', require('./newBooks'));
router.use('/events', require('./events'));
router.use('/suggestions', require('./suggestions'));
router.use('/age-groups', require('./ageGroups'));
router.use('/categories', require('./categories'));
router.use('/posts', require('./posts'));
router.use('/locations', require('./locations'));

module.exports = router;
