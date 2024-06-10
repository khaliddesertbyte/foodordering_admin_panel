import React, { useState, useEffect, useRef } from 'react';
import { firestore } from '../../firebase';
import { collection, getDocs, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import './Orders.css';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const printRefs = useRef([]);
  const [showCancelModal, setShowCancelModal] = useState(false); // State to control cancel confirmation modal
  const [cancelOrderId, setCancelOrderId] = useState(null); // State to store the id of the order to cancel
  const [showEditModal, setShowEditModal] = useState(false); // State to control edit modal
  const [editOrder, setEditOrder] = useState(null); // State to store the order being edited
  const [editedItems, setEditedItems] = useState([]); // State to store edited items

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const querySnapshot = await getDocs(collection(firestore, 'orders'));
      const ordersData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setOrders(ordersData);
      console.log('Fetched orders:', ordersData);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const handlePrint = (index) => {
    console.log('Handle Print:', printRefs.current[index]);
    const printContent = printRefs.current[index];
    const printWindow = window.open('', '', 'height=500,width=800');
    printWindow.document.write(printContent.innerHTML);
    printWindow.document.close();
    printWindow.print();
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await updateDoc(doc(firestore, 'orders', orderId), {
        status: newStatus
      });
      console.log('Order status updated successfully');
      // You may want to refresh the orders list after updating status
      fetchOrders();
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const handleDeleteOrder = async (orderId) => {
    // Set the order id to be canceled
    setCancelOrderId(orderId);
    // Show the cancel confirmation modal
    setShowCancelModal(true);
  };

  const handleConfirmCancelOrder = async () => {
    try {
      // Update the status of the order to "Cancelled"
      await updateDoc(doc(firestore, 'orders', cancelOrderId), {
        status: 'Cancelled'
      });
      console.log('Order cancelled successfully');
      // Close the cancel confirmation modal
      setShowCancelModal(false);
      // Refresh orders after cancellation
      fetchOrders();
    } catch (error) {
      console.error('Error cancelling order:', error);
    }
  };

  const handleEditOrder = (order) => {
    // Set the order being edited
    setEditOrder(order);
    // Initialize editedItems with the order's items
    setEditedItems(order.items.map(item => ({ ...item })));
    // Show the edit modal
    setShowEditModal(true);
  };

  const handleUpdateOrder = async () => {
    try {
      // Update the order with the edited items
      await updateDoc(doc(firestore, 'orders', editOrder.id), {
        items: editedItems
      });
      console.log('Order updated successfully');
      // Close the edit modal
      setShowEditModal(false);
      // Refresh orders after update
      fetchOrders();
    } catch (error) {
      console.error('Error updating order:', error);
    }
  };

  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="orders-container">
      <h2>Orders</h2>
      <table className="orders-table">
        <thead>
          <tr className='orders-heading'>
            <th>SN</th>
            <th>Username</th>
            <th>Items</th>
            <th>Phone Number</th>
            <th>Order Date</th>
            <th>Status</th>
            <th>Actions</th>
            <th>Print Invoice</th>
            
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
              <td>{order.date}</td>
              <td>{order.status}</td>
              <td>
                <div className='action-button'>
              <button onClick={() => handleDeleteOrder(order.id)} className='cancel-order'>Cancel Order</button>
              <button onClick={() => handleEditOrder(order)} className='edit-order'>Edit Order</button>
              </div>
              </td>
              <td>
                <button className="print-button" onClick={() => handlePrint(index)}>Print Invoice</button>
                <div style={{ display: 'none' }}>
                  <div ref={el => (printRefs.current[index] = el)} className="print-section" style={{display:"none"}}>
                  <div style={{ position: "absolute", top: "0px", right: "10px" }}>
                  <p>Date:{formattedDate}</p>
                 </div>
                    <div className="bill-header" style={{display:"flex", flexDirection:"column",justifyContent:"space-between"}}>
  
                      <div className="company-info" style={{display:"flex", alignItems:"center"}}>
                        <img src="https://marketplace.canva.com/EAFzZd9frfk/1/0/1600w/canva-colorful-illustrative-restaurant-master-chef-logo-4rQv_oY-CF8.jpg" alt="Company Logo" className="company-logo" style={{width:"80px",height:"80px",margin:"10px"}}/>
                        <div style={{marginLeft:"150px"}}>
                          <h2 style={{ lineHeight: "0.3", }}>Master Chef Restaurant</h2>
                          <p style={{ lineHeight: "0.3",textAlign:"center" }}>Lusail, Qatar  +974-12345678</p>
                          
                        </div>
                      </div>
                      <div className="customer-info" style={{margin:"5px 0"}}>
                        <p><strong>Customer Name:</strong> {order.username}</p>
                        <p><strong>Phone Number:</strong> {order.phonenumber}</p>
                        <p><strong>Order Date:</strong> {order.date}</p>
                      </div>
                    </div>
                    <div className="bill-details">
                      <table className="bill-table" style={{width:"100%",borderCollapse:"collapse",marginTop:"20px"}}>
                        <thead>
                          <tr style={{border:"1px solid black",textAlign:"center"}}>
                            <th style={{border:"1px solid black"}}>Item Name</th>
                            <th style={{border:"1px solid black"}}>Price</th>
                            <th style={{border:"1px solid black"}}>Quantity</th>
                          </tr>
                        </thead>
                        <tbody>
                          {order.items && order.items.map(item => (
                            <tr key={item.id} style={{border:"1px solid black",textAlign:"center"}}>
                              <td style={{border:"1px solid black"}}>{item.name}</td>
                              <td style={{border:"1px solid black"}}>${item.price}</td>
                              <td style={{border:"1px solid black"}}>{item.quantity}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </td>
             
            </tr>
          ))}
        </tbody>
      </table>
    {/* Cancel order confirmation modal */}
      {showCancelModal && (
        <div className="modal">
          <div className="modal-content">
            <h4>Confirm Cancel</h4>
            <p>Are you sure you want to cancel this order?</p>
            <div className="modal-buttons">
              <button className="confirm-cancel-button" onClick={handleConfirmCancelOrder}>Confirm Cancel Order</button>
              <button className="cancel-button" onClick={() => setShowCancelModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit order modal */}
      {showEditModal && (
        <div className="modal">
          <div className="modal-content">
            <h4>Edit Order</h4>
            <div className="order-items">
              {editedItems.map((item, index) => (
                <div key={index}>
                  <p>Item: {item.name}</p>
                  <p>Price: ${item.price}</p>
                  <label>Quantity:</label>
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      const newItems = [...editedItems];
                      newItems[index].quantity = value;
                      setEditedItems(newItems);
                    }}
                  />
                </div>
              ))}
            </div>
            <button className="update-order-button" onClick={handleUpdateOrder}>Update Order</button>
            <button className="cancel-button" onClick={() => setShowEditModal(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );

};

export default Orders;
