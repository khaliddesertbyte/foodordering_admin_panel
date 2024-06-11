import React, { useState, useEffect, useRef } from 'react';
import { firestore } from '../../firebase';
import { collection, getDocs } from 'firebase/firestore';
import { Line } from 'react-chartjs-2';
import jsPDF from 'jspdf';
import 'chart.js/auto'; // This is needed for Chart.js v3
import './Reports.css';

const CustomerReport = () => {
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [
      {
        label: 'Customers',
        data: [],
        borderColor: 'rgba(255, 99, 132, 1)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        fill: true,
        tension: 0.4,
      },
    ],
  });
  const [timeRange, setTimeRange] = useState('daily');
  const chartRef = useRef(null);

  useEffect(() => {
    fetchCustomerData();
  }, [timeRange]);

  const fetchCustomerData = async () => {
    try {
      const customersSnapshot = await getDocs(collection(firestore, 'users'));
      const customers = customersSnapshot.docs.map(doc => doc.data());
      console.log('Fetched customers:', customers);
  
      // Process data based on the selected time range
      const data = processData(customers, timeRange);
      console.log('Processed data:', data);
  
      setChartData({
        labels: data.map(item => item.date),
        datasets: [
          {
            label: 'Customers',
            data: data.map(item => item.totalCustomers),
            borderColor: 'rgba(255, 99, 132, 1)',
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            fill: true,
            tension: 0.4,
          },
        ],
      });
    } catch (error) {
      console.error('Error fetching customer data:', error);
    }
  };
  

  const processData = (customers, range) => {
    const processedData = [];
    const now = new Date();
    customers.forEach(customer => {
      // Check if `createdAt` is defined before converting to Date
      const createdAt = customer.createdAt ? customer.createdAt.toDate() : null;
      if (!createdAt) return; // Skip if createdAt is not defined
  
      const dateString = createdAt.toLocaleDateString();
  
      let addToData = false;
      if (range === 'daily' && now.toDateString() === createdAt.toDateString()) {
        addToData = true;
      } else if (range === 'weekly' && now.getTime() - createdAt.getTime() <= 7 * 24 * 60 * 60 * 1000) {
        addToData = true;
      } else if (range === 'monthly' && now.getMonth() === createdAt.getMonth() && now.getFullYear() === createdAt.getFullYear()) {
        addToData = true;
      }
  
      if (addToData) {
        const existingData = processedData.find(item => item.date === dateString);
        if (existingData) {
          existingData.totalCustomers++;
        } else {
          processedData.push({
            date: dateString,
            totalCustomers: 1,
          });
        }
      }
    });
    return processedData.length > 0 ? processedData : [{ date: now.toLocaleDateString(), totalCustomers: 0 }];
  };
  

  const downloadPDF = () => {
    const chartInstance = chartRef.current;
    if (chartInstance) {
      const chartCanvas = chartInstance.canvas;
      const doc = new jsPDF();
      doc.text('Customer Report', 20, 10);
      doc.addImage(chartCanvas.toDataURL('image/png'), 'PNG', 10, 20, 190, 90);
      doc.save('customer_report.pdf');
    }
  };

  return (
    <div className="report-container">
      <h2>Customer Report</h2>
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

export default CustomerReport;
