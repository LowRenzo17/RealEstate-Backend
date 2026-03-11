export const tenantContext = (req, res, next) => {
  // If user is authenticated and has an organizationId, attach it to the request
  if (req.user && req.user.organizationId) {
    req.organizationId = req.user.organizationId;
  }
  
  // For multi-tenant queries, we can use this in our controllers
  // For example: Model.find({ organizationId: req.organizationId })
  
  next();
};

export const restrictToOrganization = (req, res, next) => {
  if (!req.organizationId && req.user.role !== 'tenant') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. No organization context found.'
    });
  }
  next();
};
