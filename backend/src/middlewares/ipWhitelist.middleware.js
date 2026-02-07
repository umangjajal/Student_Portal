export default (req, res, next) => {
  const allowedIP = process.env.ADMIN_ALLOWED_IP;
  const requestIP = req.ip.replace("::ffff:", "");

  // Allow localhost in development
  if (process.env.NODE_ENV === "development") {
    return next();
  }

  if (allowedIP && requestIP !== allowedIP) {
    return res.status(403).json({ message: "IP not allowed" });
  }

  next();
};
