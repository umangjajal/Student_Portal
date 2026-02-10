export default (req, res, next) => {
  // Always allow in development
  if (process.env.NODE_ENV === "development") {
    return next();
  }

  const allowedIP = process.env.ADMIN_ALLOWED_IP;
  const requestIP = req.ip.replace("::ffff:", "");

  if (allowedIP && requestIP !== allowedIP) {
    return res.status(403).json({
      message: "Admin access restricted by IP"
    });
  }

  next();
};
