import Organization from '../models/Organization.js';
import User from '../models/User.js';

export const createOrganization = async (req, res, next) => {
  try {
    const { name, subscriptionPlan } = req.body;
    
    // Create the organization
    const organization = await Organization.create({
      name,
      ownerId: req.user.id,
      subscriptionPlan
    });

    // Update the user with the organizationId
    await User.findByIdAndUpdate(req.user.id, { organizationId: organization._id });

    res.status(201).json({ success: true, data: organization });
  } catch (err) {
    next(err);
  }
};

export const getOrganization = async (req, res, next) => {
  try {
    const organization = await Organization.findById(req.organizationId);
    if (!organization) return res.status(404).json({ success: false, message: 'Organization not found' });
    res.status(200).json({ success: true, data: organization });
  } catch (err) {
    next(err);
  }
};
