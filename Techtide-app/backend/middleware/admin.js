function requireAdmin(req, res, next) {
  // Temporary debug — remove after it works
  console.log('🔐 requireAdmin check:', {
    hasUser: !!req.user,
    role: req.user?.role,
    id: req.user?.id,
  });

  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      message: 'Admin access required.',
      yourRole: req.user?.role ?? 'none',
    });
  }

  next();
}

module.exports = { requireAdmin };