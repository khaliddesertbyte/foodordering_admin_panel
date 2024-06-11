import React, { useState, useEffect, useRef } from 'react';
import { firestore } from '../../firebase';
import { collection, getDocs } from 'firebase/firestore';
import { Line } from 'react-chartjs-2';
import jsPDF from 'jspdf';
import 'chart.js/auto'; // This is needed for Chart.js v3
import './Reports.css';

const SalesReport = () => {
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [
      {
        label: 'Sales',
        data: [],
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        fill: true,
        tension: 0.4,
      },
    ],
  });
  const [timeRange, setTimeRange] = useState('daily');
  const chartRef = useRef(null);

  useEffect(() => {
    fetchSalesData();
  }, [timeRange]);

  const fetchSalesData = async () => {
    try {
      const ordersSnapshot = await getDocs(collection(firestore, 'orders'));
      const orders = ordersSnapshot.docs.map(doc => doc.data());

      // Process data based on the selected time range
      const data = processData(orders, timeRange);
      setChartData({
        labels: data.map(item => item.date),
        datasets: [
          {
            label: 'Sales',
            data: data.map(item => item.totalSales),
            borderColor: 'rgba(75, 192, 192, 1)',
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            fill: true,
            tension: 0.4,
          },
        ],
      });
    } catch (error) {
      console.error('Error fetching sales data:', error);
    }
  };

  const processData = (orders, range) => {
    const processedData = [];
    const now = new Date();
    orders.forEach(order => {
      const orderDate = new Date(order.date);
      const dateString = orderDate.toLocaleDateString();

      let addToData = false;
      if (range === 'daily' && now.toDateString() === orderDate.toDateString()) {
        addToData = true;
      } else if (range === 'weekly' && now.getTime() - orderDate.getTime() <= 7 * 24 * 60 * 60 * 1000) {
        addToData = true;
      } else if (range === 'monthly' && now.getMonth() === orderDate.getMonth() && now.getFullYear() === orderDate.getFullYear()) {
        addToData = true;
      }

      if (addToData) {
        const existingData = processedData.find(item => item.date === dateString);
        const orderTotal = order.items.reduce((acc, item) => {
          // Convert item.price to number if it's a string
          const itemPrice = typeof item.price === 'string' ? parseFloat(item.price.replace('$', '')) : item.price;
          return acc + itemPrice;
        }, 0);

        if (existingData) {
          existingData.totalSales += orderTotal;
        } else {
          processedData.push({
            date: dateString,
            totalSales: orderTotal,
          });
        }
      }
    });
    return processedData.length > 0 ? processedData : [{ date: now.toLocaleDateString(), totalSales: 0 }];
  };

  const downloadPDF = () => {
    const chartInstance = chartRef.current;
    if (chartInstance) {
      const chartCanvas = chartInstance.canvas;
      const doc = new jsPDF();
      doc.text('Sales Report', 20, 10);
      doc.addImage(chartCanvas.toDataURL('image/png'), 'PNG', 10, 20, 190, 90);
      doc.save('sales_report.pdf');
    }
  };

  return (
    <div className="report-container">
      <h2>Sales Report</h2>
      <div className="time-range-buttons">
        <button onClick={() => setTimeRange('daily')}>Daily</button>
        <button onClick={() => setTimeRange('weekly')}>Weekly</button>
        <button onClick={() => setTimeRange('monthly')}>Monthly</button>
      </div>
      <Line ref={chartRef} data={chartData} />
      <button onClick={downloadPDF} className='download-button'>Download Report</button>
    </div>
  );
};

export default SalesReport;
