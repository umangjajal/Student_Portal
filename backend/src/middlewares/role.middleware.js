/**
 * Advanced Role Authorization Middleware
 * - ADMIN has full override access
 * - Supports multiple allowed roles
 * - Case insensitive
 * - Safe session validation
 */

export const roleCheck = (...allowedRoles) => {
  return (req, res, next) => {

    /* ==============================
       1️⃣ Validate user session
    ============================== */
    if (!req.user || !req.user.role) {
      return res.status(403).json({
        success: false,
        message: "Access denied. No valid role found in your session."
      });
    }

    const userRole = String(req.user.role).toUpperCase();
    const permittedRoles = allowedRoles.map(role =>
      String(role).toUpperCase()
    );

    /* ==============================
       2️⃣ ADMIN FULL ACCESS OVERRIDE
    ============================== */
    if (userRole === "ADMIN") {
      return next();
    }

    /* ==============================
       3️⃣ Check if role allowed
    ============================== */
    if (!permittedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Your role is '${req.user.role}', but this action requires: ${allowedRoles.join(", ")}.`
      });
    }

    /* ==============================
       4️⃣ University session validation
       (Prevents "Invalid university session")
    ============================== */
    if (userRole === "UNIVERSITY") {
      if (!req.user.referenceId) {
        return res.status(400).json({
          success: false,
          message: "Invalid university session. Please login again."
        });
      }
    }

    next();
  };
};

// Backward compatibility
export const authorizeRole = roleCheck;
