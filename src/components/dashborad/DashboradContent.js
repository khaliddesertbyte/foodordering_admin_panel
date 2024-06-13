import React, { useState, useEffect } from 'react';
import { firestore } from '../../firebase';
import { collection, getDocs } from 'firebase/firestore';
import './DashboradContent.css';
import SalesReport from './SalesReport';
import OrderReport from './OrderReport';
import CustomerReport from './CustomerReport';

const DashboardContent = () => {
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalCanceledOrders, setTotalCanceledOrders] = useState(0);
  const [totalSales, setTotalSales] = useState(0);
  const [totalCustomers, setTotalCustomers] = useState(0);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const ordersSnapshot = await getDocs(collection(firestore, 'orders'));
      const customersSnapshot = await getDocs(collection(firestore, 'users'));

      const ordersData = ordersSnapshot.docs.map(doc => doc.data());
      console.log(ordersData)
      const customersData = customersSnapshot.docs.map(doc => doc.data());

      const totalOrdersCount = ordersData.length;
      const totalCanceledOrdersCount = ordersData.filter(order => order.status === 'Canceled').length;
      const totalSalesAmount = ordersData.reduce((acc, order) => {
        const itemsTotal = order.items ? order.items.reduce((itemAcc, item) => {
          // Convert item.price to number if it's a string
          const itemPrice = typeof item.price === 'string' ? parseFloat(item.price.replace('$', '')) : item.price;
          return itemAcc + itemPrice;
        }, 0) : 0;
        return acc + itemsTotal;
      }, 0);
      const totalCustomersCount = customersData.length;

      setTotalOrders(totalOrdersCount);
      setTotalCanceledOrders(totalCanceledOrdersCount);
      setTotalSales(totalSalesAmount);
      setTotalCustomers(totalCustomersCount);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  return (
    <div className="dashboard-container-content">
      <h2>Dashboard</h2>
      <div className="dashboard-stats">
        <div className="stat-item">
          <h3>Total Orders</h3>
          <p>{totalOrders}</p>
        </div>
        <div className="stat-item">
          <h3>Total Canceled Orders</h3>
          <p>{totalCanceledOrders}</p>
        </div>
        <div className="stat-item">
          <h3>Total Sales</h3>
          <p>${typeof totalSales === 'number' ? totalSales.toFixed(2) : 0}</p>
        </div>
        <div className="stat-item">
          <h3>Total Customers</h3>
          <p>{totalCustomers}</p>
        </div>
      </div>
      <SalesReport/>
      <OrderReport/>
      <CustomerReport/>
    </div>
  );
};

export default DashboardContent;
