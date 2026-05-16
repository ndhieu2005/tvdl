const success = (res, data = {}, message = 'OK', meta = {}, statusCode = 200) => {
  return res.status(statusCode).json({ status: 'success', message, data, meta });
};

const error = (res, message = 'Internal server error', error_code = 'INTERNAL_ERROR', statusCode = 500) => {
  return res.status(statusCode).json({ status: 'error', error_code, message, data: null, meta: {} });
};

module.exports = { success, error };
