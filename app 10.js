// server/routes/admin.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const mongoose = require('mongoose');

// Dashboard metrics
router.get('/dashboard', auth, admin, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const [
      totalUsers,
      totalProducts,
      totalOrders,
      todayOrders,
      revenueData,
      lowStockProducts
    ] = await Promise.all([
      User.countDocuments(),
      Product.countDocuments(),
      Order.countDocuments(),
      Order.countDocuments({ createdAt: { $gte: today } }),
      Order.aggregate([
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" },
              day: { $dayOfMonth: "$createdAt" }
            },
            total: { $sum: "$totalAmount" },
            count: { $sum: 1 }
          }
        },
        { $sort: { "_id.year": -1, "_id.month": -1, "_id.day": -1 } },
        { $limit: 30 }
      ]),
      Product.find({ stock: { $lte: 10 }, status: 'active' })
    ]);
    
    const totalRevenue = await Order.aggregate([
      { $match: { paymentStatus: 'completed' } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } }
    ]);
    
    res.json({
      metrics: {
        totalUsers,
        totalProducts,
        totalOrders,
        todayOrders,
        totalRevenue: totalRevenue[0]?.total || 0,
        lowStockCount: lowStockProducts.length
      },
      revenueData,
      lowStockProducts
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all users (Admin)
router.get('/users', auth, admin, async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    let query = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }
    
    const users = await User.find(query)
      .select('-password')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort('-createdAt');
    
    const total = await User.countDocuments(query);
    
    res.json({
      users,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all orders with filters (Admin)
router.get('/orders', auth, admin, async (req, res) => {
  try {
    const { status, startDate, endDate, page = 1, limit = 20 } = req.query;
    let query = {};
    
    if (status) query.orderStatus = status;
    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    const orders = await Order.find(query)
      .populate('user', 'name email phone')
      .populate('items.product')
      .sort('-createdAt')
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Order.countDocuments(query);
    
    res.json({
      orders,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Export sales report
router.get('/export-sales', auth, admin, async (req, res) => {
  try {
    const { startDate, endDate, format = 'json' } = req.query;
    
    const query = {};
    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    const orders = await Order.find(query)
      .populate('user', 'name email')
      .populate('items.product');
    
    if (format === 'csv') {
      const csvData = orders.map(order => ({
        'Order ID': order._id,
        'Customer': order.user.name,
        'Email': order.user.email,
        'Total Amount': order.totalAmount,
        'Status': order.orderStatus,
        'Date': order.createdAt.toISOString().split('T')[0]
      }));
      
      res.json({ data: csvData, format: 'csv' });
    } else {
      res.json(orders);
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;