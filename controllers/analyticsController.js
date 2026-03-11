import Unit from '../models/Unit.js';
import Payment from '../models/Payment.js';
import Tenant from '../models/Tenant.js';
import mongoose from 'mongoose';

export const getOccupancyAnalytics = async (req, res, next) => {
  try {
    const orgId = new mongoose.Types.ObjectId(req.organizationId);

    const stats = await Unit.aggregate([
      { $match: { organizationId: orgId } },
      {
        $group: {
          _id: null,
          totalUnits: { $sum: 1 },
          occupiedUnits: {
            $sum: { $cond: [{ $eq: ['$status', 'occupied'] }, 1, 0] }
          },
          vacantUnits: {
            $sum: { $cond: [{ $eq: ['$status', 'vacant'] }, 1, 0] }
          }
        }
      },
      {
        $project: {
          _id: 0,
          totalUnits: 1,
          occupiedUnits: 1,
          vacantUnits: 1,
          occupancyRate: {
            $multiply: [{ $divide: ['$occupiedUnits', '$totalUnits'] }, 100]
          }
        }
      }
    ]);

    res.status(200).json({ success: true, data: stats[0] || {} });
  } catch (err) {
    next(err);
  }
};

export const getRevenueAnalytics = async (req, res, next) => {
  try {
    const orgId = new mongoose.Types.ObjectId(req.organizationId);

    const revenue = await Payment.aggregate([
      { $match: { organizationId: orgId, status: 'paid' } },
      {
        $group: {
          _id: { $month: '$paymentDate' },
          monthlyRevenue: { $sum: '$amount' }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    const outstanding = await Tenant.aggregate([
      { $match: { organizationId: orgId, rentStatus: { $ne: 'paid' } } },
      {
        $lookup: {
          from: 'units',
          localField: 'unitId',
          foreignField: '_id',
          as: 'unit'
        }
      },
      { $unwind: '$unit' },
      {
        $group: {
          _id: null,
          outstandingRent: { $sum: '$unit.rentAmount' }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        monthlyRevenue: revenue,
        outstandingRent: outstanding[0]?.outstandingRent || 0
      }
    });
  } catch (err) {
    next(err);
  }
};

export const getLatePayments = async (req, res, next) => {
  try {
    const orgId = new mongoose.Types.ObjectId(req.organizationId);
    
    const lateTenants = await Tenant.find({
      organizationId: orgId,
      rentStatus: 'overdue'
    }).populate('unitId');

    res.status(200).json({ success: true, count: lateTenants.length, data: lateTenants });
  } catch (err) {
    next(err);
  }
};
