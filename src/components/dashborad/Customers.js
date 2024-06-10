import React, { useState, useEffect } from 'react';
import { firestore } from '../../firebase';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import './Customers.css';

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteCustomerId, setDeleteCustomerId] = useState(null);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const querySnapshot = await getDocs(collection(firestore, 'users'));
      const customersData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCustomers(customersData);
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  const handleDeleteCustomer = async () => {
    try {
      await deleteDoc(doc(firestore, 'users', deleteCustomerId));
      setCustomers(customers.filter(customer => customer.id !== deleteCustomerId));
      setShowDeleteConfirm(false);
      setDeleteCustomerId(null);
    } catch (error) {
      console.error('Error deleting customer:', error);
    }
  };

  return (
    <div className="customers-container">
      <h2>Customers</h2>
      <table className="customers-table">
        <thead>
          <tr>
            <th>SN</th>
            <th>Name</th>
            <th>Email</th>
            <th>Phone Number</th>
            <th>Address</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {customers.map((customer, index) => (
            <tr key={customer.id}>
              <td>{index + 1}</td>
              <td>{customer.name}</td>
              <td>{customer.email}</td>
              <td>{customer.phoneNumber}</td>
              <td>{customer.address}</td>
              <td>
                <button
                  className="delete-button"
                  onClick={() => {
                    setShowDeleteConfirm(true);
                    setDeleteCustomerId(customer.id);
                  }}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showDeleteConfirm && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={() => setShowDeleteConfirm(false)}>&times;</span>
            <p>Are you sure you want to delete this customer?</p>
            <button className="confirm-delete-button" onClick={handleDeleteCustomer}>Confirm Delete</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Customers;
