import React, { useState, useEffect } from 'react';
import { firestore } from '../../firebase';
import { collection, getDocs } from 'firebase/firestore';
import './Orders.css';

const Orders = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const querySnapshot = await getDocs(collection(firestore, 'orders'));
      const ordersData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setOrders(ordersData);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  return (
    <div className="orders-container">
      <h2>Orders</h2>
      <table className="orders-table">
        <thead>
          <tr>
            <th>SN</th>
            <th>Username</th>
            <th>Items</th>
            <th>Phone Number</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order, index) => (
            <tr key={order.id}>
              <td>{index + 1}</td>
              <td>{order.username}</td>
              <td>
                {order.items && order.items.length > 0 ? (
                  <ul className='orders-ul'>
                    {order.items.map((item, i) => (
                      <li key={i} className='orders-li'>
                        <div>
                          <img src={item.image} alt={item.name} className="order-item-image" />
                        </div>
                        <div>
                          <p>{item.name}</p>
                          <p>Price: ${item.price}</p>
                          <p>Quantity: {item.quantity}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No items</p>
                )}
              </td>
              <td>{order.phonenumber}</td>
              <td>{order.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Orders;
