const { error } = require('../utils/response');

module.exports = (err, req, res, next) => {
  console.error(err);
  return error(res, err.message || 'Internal server error', 'INTERNAL_ERROR', 500);
};
