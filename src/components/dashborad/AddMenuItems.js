import React, { useState, useEffect } from 'react';
import { firestore, storage } from '../../firebase';
import { collection, addDoc, getDocs, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import './AddMenuItems.css';

const AddMenuItems = () => {
  const [itemName, setItemName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [category, setCategory] = useState('All');
  const [menuItems, setMenuItems] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [user, setUser] = useState(null);
  const [editItemId, setEditItemId] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteItemId, setDeleteItemId] = useState(null);
  const [showTopDishConfirm, setShowTopDishConfirm] = useState(false);
  const [topDishItemId, setTopDishItemId] = useState(null);
  const [isAddingToTopDishes, setIsAddingToTopDishes] = useState(true);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        fetchMenuItems();
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchMenuItems = async () => {
    try {
      const snapshot = await getDocs(collection(firestore, 'menuItems'));
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMenuItems(items);
    } catch (error) {
      console.error("Error fetching menu items: ", error);
    }
  };

  const handleAddItem = async () => {
    if (!user) {
      console.error("User is not authenticated.");
      return;
    }

    try {
      let newImageUrl = imageUrl;
      if (imageFile) {
        const imageRef = ref(storage, `images/${imageFile.name}`);
        const snapshot = await uploadBytes(imageRef, imageFile);
        newImageUrl = await getDownloadURL(snapshot.ref);
      }

      const newItem = {
        itemName,
        price,
        description,
        image: newImageUrl,
        category,
        topDish: false // Default value for new items
      };

      if (editItemId) {
        const itemDoc = doc(firestore, 'menuItems', editItemId);
        await updateDoc(itemDoc, newItem);
        setMenuItems(menuItems.map(item => item.id === editItemId ? { id: editItemId, ...newItem } : item));
      } else {
        const docRef = await addDoc(collection(firestore, 'menuItems'), newItem);
        setMenuItems([...menuItems, { id: docRef.id, ...newItem }]);
      }
      
      setItemName('');
      setPrice('');
      setDescription('');
      setImageFile(null);
      setCategory('All');
      setShowForm(false);
      setEditItemId(null);
    } catch (error) {
      console.error("Error adding/updating menu item: ", error);
    }
  };

  const handleEdit = (item) => {
    setItemName(item.itemName);
    setPrice(item.price);
    setDescription(item.description);
    setImageUrl(item.image); // Set imageUrl state for editing
    setCategory(item.category);
    setShowForm(true);
    setEditItemId(item.id);
  };

  const handleDeleteConfirm = (itemId) => {
    setShowDeleteConfirm(true);
    setDeleteItemId(itemId);
  };

  const handleDelete = async () => {
    try {
      await deleteDoc(doc(firestore, 'menuItems', deleteItemId));
      setMenuItems(menuItems.filter(item => item.id !== deleteItemId));
      setShowDeleteConfirm(false);
      setDeleteItemId(null);
    } catch (error) {
      console.error("Error deleting menu item: ", error);
    }
  };

  const handleCategoryClick = (category) => {
    setCategory(category);
  };

  const handleToggleTopDishes = (itemId, isAdding) => {
    setTopDishItemId(itemId);
    setIsAddingToTopDishes(isAdding);
    setShowTopDishConfirm(true);
  };

  const confirmToggleTopDishes = async () => {
    try {
      const itemDoc = doc(firestore, 'menuItems', topDishItemId);
      await updateDoc(itemDoc, { topDish: isAddingToTopDishes });
      setMenuItems(menuItems.map(item => item.id === topDishItemId ? { ...item, topDish: isAddingToTopDishes } : item));
      setShowTopDishConfirm(false);
      setTopDishItemId(null);
    } catch (error) {
      console.error("Error toggling top dishes status: ", error);
    }
  };

  const filteredItems = category === 'All' ? menuItems : menuItems.filter(item => item.category === category);

  return (
    <div className="containeritems">
      <h2>Add Menu Items</h2>
      <button className="add-button" onClick={() => setShowForm(true)}>Add New Item</button>
      {showForm && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={() => setShowForm(false)}>&times;</span>
            <div className="form-group">
              <label htmlFor="itemName">Item Name:</label>
              <input type="text" id="itemName" value={itemName} onChange={(e) => setItemName(e.target.value)} />
            </div>
            <div className="form-group">
              <label htmlFor="price">Price:</label>
              <input type="text" id="price" value={price} onChange={(e) => setPrice(e.target.value)} />
            </div>
            <div className="form-group">
              <label htmlFor="description">Description:</label>
              <input type="text" id="description" value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            <div className="form-group">
              <label htmlFor="image">Image:</label>
              <input type="file" id="image" onChange={(e) => setImageFile(e.target.files[0])} />
            </div>
            <div className="form-group">
              <label htmlFor="category">Category:</label>
              <select id="category" value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="All">All</option>
                <option value="Breakfast">Breakfast</option>
                <option value="Lunch">Lunch</option>
                <option value="Snacks">Snacks</option>
                <option value="Dinner">Dinner</option>
                <option value="Drinks">Drinks</option>
              </select>
            </div>
            <button className="add-button" onClick={handleAddItem}>{editItemId ? 'Update Item' : 'Add New Item'}</button>
          </div>
        </div>
      )}
      <div className="buttons-container">
        <button className="category-button" onClick={() => handleCategoryClick('All')}>All</button>
        <button className="category-button" onClick={() => handleCategoryClick('Breakfast')}>Breakfast</button>
        <button className="category-button" onClick={() => handleCategoryClick('Lunch')}>Lunch</button>
        <button className="category-button" onClick={() => handleCategoryClick('Snacks')}>Snacks</button>
        <button className="category-button" onClick={() => handleCategoryClick('Dinner')}>Dinner</button>
        <button className="category-button" onClick={() => handleCategoryClick('Drinks')}>Drinks</button>
      </div>
      <h3>Menu Items</h3>
      <table className="menu-table">
        <thead>
          <tr>
            <th>Category</th>
            <th>Item Name</th>
            <th>Price</th>
            <th>Description</th>
            <th>Image</th>
            <th>Top Dishes</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredItems.map((item, index) => (
            <tr key={index}>
              <td>{item.category}</td>
              <td>{item.itemName}</td>
              <td>QAR {item.price}</td>
              <td>{item.description}</td>
              <td>
                {item.image ? (
                  <img src={item.image} alt={item.itemName} className="item-image" />
                ) : (
                  <span className="image-placeholder">No Image Available</span>
                )}
              </td>
              <td>
                {item.topDish ? "This item is added as top dish" : "This item is not added as top dish"}
              </td>
              <td className="action-buttons">
                <div className="edit-delete-buttons">
                  <button className="edit-button" onClick={() => handleEdit(item)}>Edit</button>
                  <button className="delete-button" onClick={() => handleDeleteConfirm(item.id)}>Delete</button>
                </div>
                <button className="top-dish-button" onClick={() => handleToggleTopDishes(item.id, !item.topDish)}>
                  {item.topDish ? "Remove from Top Dishes" : "Add to Top Dishes"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {showDeleteConfirm && (
        <div className="modal">
          <div className="modal-content">
            <h4>Confirm Delete</h4>
            <p>Are you sure you want to delete this item?</p>
            <button className="confirm-delete-button" onClick={handleDelete}>Confirm Delete</button>
            <button className="cancel-button" onClick={() => setShowDeleteConfirm(false)}>Cancel</button>
          </div>
        </div>
      )}
      {showTopDishConfirm && (
        <div className="modal">
          <div className="modal-content">
            <h4>Confirm {isAddingToTopDishes ? 'Add to' : 'Remove from'} Top Dishes</h4>
            <p>Are you sure you want to {isAddingToTopDishes ? 'add this item to' : 'remove this item from'} top dishes?</p>
            <button className="confirm-top-dish-button" onClick={confirmToggleTopDishes}>
              Confirm
            </button>
            <button className="cancel-button" onClick={() => setShowTopDishConfirm(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddMenuItems;
