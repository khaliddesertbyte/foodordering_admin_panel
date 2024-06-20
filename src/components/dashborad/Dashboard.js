// src/components/dashboard/Dashboard.js

import React from 'react';
import { Route, Routes, Link, useNavigate } from 'react-router-dom';
import AddMenuItems from './AddMenuItems';
import Orders from './Orders';
import Customers from './Customers';
import './Dashboard.css';
import { auth } from '../../firebase';
import DashboardContent from './DashboradContent';
import SpecialOffers from './SpecialOffers';

const Dashboard = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await auth.signOut();
    navigate('/login');
  };

  return (
    <div className="dashboard-container">
      <div className="sidebar">
        <h3>Admin Panel</h3>
        <ul>
          <li><Link to="/dashboard">Dashboard</Link></li>
          <li><Link to="/dashboard/add-menu-items">Menu Items</Link></li>
          <li><Link to="/dashboard/add-speacial-offers">Special Offers</Link></li>
          <li><Link to="/dashboard/orders">Orders</Link></li>
          <li><Link to="/dashboard/customers">Customers</Link></li>
          <li><button onClick={handleLogout}>Logout</button></li>
        </ul>
      </div>
      <div className="main-content">
        <Routes>
          <Route path="/" element={<DashboardContent/>} />
          <Route path="add-menu-items" element={<AddMenuItems />} />
          <Route path="add-speacial-offers" element={<SpecialOffers />} />
          <Route path="orders" element={<Orders />} />
          <Route path="customers" element={<Customers />} />
        </Routes>
      </div>
    </div>
  );
};

export default Dashboard;
