// Global error handling middleware
function errorMiddleware(err, req, res, next) {
  console.error('Unhandled Server Error:', err);
  
  const status = err.status || 500;
  const message = err.message || 'Something went wrong on the server.';
  
  res.status(status).json({
    error: {
      message,
      status
    }
  });
}

module.exports = errorMiddleware;
