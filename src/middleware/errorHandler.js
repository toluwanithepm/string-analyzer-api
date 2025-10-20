function errorHandler(err, req, res, next) {
  console.error(err);
  // supabase client errors often have status
  if (err && err.code && err.message) {
    return res.status(500).json({ error: err.message });
  }
  return res.status(500).json({ error: 'Internal Server Error' });
}

module.exports = { errorHandler };
