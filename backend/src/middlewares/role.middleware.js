/**
 * Middleware to check if the logged-in user has the required role(s).
 * Converts roles to UPPERCASE to prevent case-sensitivity bugs.
 */
export const roleCheck = (...allowedRoles) => {
  return (req, res, next) => {
    // 1. Check if the user object and role exist in the request
    if (!req.user || !req.user.role) {
      return res.status(403).json({
        message: "Access denied. No valid role found in your session."
      });
    }

    // 2. Convert both the user's role and allowed roles to UPPERCASE
    const userRole = String(req.user.role).toUpperCase();
    const permittedRoles = allowedRoles.map(role => String(role).toUpperCase());

    // 3. Check if the user's role is in the list of permitted roles
    if (!permittedRoles.includes(userRole)) {
      return res.status(403).json({
        message: `Access denied. Your role is '${req.user.role}', but this action requires: ${allowedRoles.join(", ")}.`
      });
    }

    // 4. Role is valid, proceed to the controller
    next();
  };
};

// Provide an alias in case some of your route files import 'authorizeRole' instead of 'roleCheck'
export const authorizeRole = roleCheck;