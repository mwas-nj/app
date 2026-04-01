// admin/src/pages/Dashboard.js
import React, { useState, useEffect } from 'react';
import { useNotification } from '../contexts/NotificationContext';
import api from '../services/api';
import MetricCard from '../components/MetricCard';
import RevenueChart from '../components/RevenueChart';
import LowStockAlert from '../components/LowStockAlert';
import RecentOrders from '../components/RecentOrders';

const Dashboard = () => {
  const [metrics, setMetrics] = useState({});
  const [revenueData, setRevenueData] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showNotification } = useNotification();

  useEffect(() => {
    fetchDashboardData();
    // Set up polling for real-time updates
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/admin/dashboard');
      setMetrics(response.data.metrics);
      setRevenueData(response.data.revenueData);
      setLowStockProducts(response.data.lowStockProducts);
    } catch (error) {
      showNotification('Failed to fetch dashboard data', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="dashboard">
      <h1 className="mb-4">Dashboard</h1>
      
      <div className="row mb-4">
        <div className="col-md-3">
          <MetricCard
            title="Total Revenue"
            value={`$${metrics.totalRevenue?.toLocaleString() || 0}`}
            icon="💰"
            trend="+12%"
          />
        </div>
        <div className="col-md-3">
          <MetricCard
            title="Total Users"
            value={metrics.totalUsers || 0}
            icon="👥"
            trend="+5%"
          />
        </div>
        <div className="col-md-3">
          <MetricCard
            title="Total Orders"
            value={metrics.totalOrders || 0}
            icon="📦"
            trend="+8%"
          />
        </div>
        <div className="col-md-3">
          <MetricCard
            title="Today's Orders"
            value={metrics.todayOrders || 0}
            icon="📊"
          />
        </div>
      </div>

      <div className="row">
        <div className="col-md-8">
          <RevenueChart data={revenueData} />
        </div>
        <div className="col-md-4">
          <LowStockAlert products={lowStockProducts} />
        </div>
      </div>

      <div className="row mt-4">
        <div className="col-12">
          <RecentOrders />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;