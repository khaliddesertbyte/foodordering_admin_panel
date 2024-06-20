import React, { useState, useEffect } from 'react';
import { firestore, storage } from '../../firebase';
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  doc,
  deleteDoc,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import './SpecialOffers.css';

const SpecialOffers = () => {
  const [itemName, setItemName] = useState('');
  const [actualPrice, setActualPrice] = useState('');
  const [discountPercentage, setDiscountPercentage] = useState('');
  const [offerDescription, setOfferDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [offers, setOffers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [user, setUser] = useState(null);
  const [editOfferId, setEditOfferId] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteOfferId, setDeleteOfferId] = useState(null);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        fetchOffers();
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchOffers = async () => {
    try {
      const snapshot = await getDocs(collection(firestore, 'offers'));
      const items = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setOffers(items);
    } catch (error) {
      console.error('Error fetching offers: ', error);
    }
  };

  const calculatePriceAfterDiscount = () => {
    const price = parseFloat(actualPrice);
    const discount = parseFloat(discountPercentage);
    if (!isNaN(price) && !isNaN(discount)) {
      const discountedPrice = price - (price * discount) / 100;
      return discountedPrice.toFixed(2);
    }
    return '';
  };

  const handleAddOffer = async () => {
    if (!user) {
      console.error('User is not authenticated.');
      return;
    }

    try {
      let newImageUrl = imageUrl;
      if (imageFile) {
        const imageRef = ref(storage, `images/${imageFile.name}`);
        const snapshot = await uploadBytes(imageRef, imageFile);
        newImageUrl = await getDownloadURL(snapshot.ref);
      }

      const priceAfterDiscount = calculatePriceAfterDiscount();

      const newOffer = {
        itemName,
        actualPrice: parseFloat(actualPrice),
        discountPercentage: parseFloat(discountPercentage),
        offerDescription,
        image: newImageUrl,
        price: parseFloat(priceAfterDiscount),
      };

      if (editOfferId) {
        const offerDoc = doc(firestore, 'offers', editOfferId);
        await updateDoc(offerDoc, newOffer);
        setOffers(
          offers.map((offer) =>
            offer.id === editOfferId ? { id: editOfferId, ...newOffer } : offer
          )
        );
      } else {
        const docRef = await addDoc(collection(firestore, 'offers'), newOffer);
        setOffers([...offers, { id: docRef.id, ...newOffer }]);
      }

      setItemName('');
      setActualPrice('');
      setDiscountPercentage('');
      setOfferDescription('');
      setImageFile(null);
      setShowForm(false);
      setEditOfferId(null);
    } catch (error) {
      console.error('Error adding/updating offer: ', error);
    }
  };

  const handleEdit = (offer) => {
    setItemName(offer.itemName);
    setActualPrice(offer.actualPrice.toString());
    setDiscountPercentage(offer.discountPercentage.toString());
    setOfferDescription(offer.offerDescription);
    setImageUrl(offer.image);
    setShowForm(true);
    setEditOfferId(offer.id);
  };

  const handleDeleteConfirm = (offerId) => {
    setShowDeleteConfirm(true);
    setDeleteOfferId(offerId);
  };

  const handleDelete = async () => {
    try {
      await deleteDoc(doc(firestore, 'offers', deleteOfferId));
      setOffers(offers.filter((offer) => offer.id !== deleteOfferId));
      setShowDeleteConfirm(false);
      setDeleteOfferId(null);
    } catch (error) {
      console.error('Error deleting offer: ', error);
    }
  };

  return (
    <div className="container-offers">
      <h2>Special Offers</h2>
      <button className="add-button" onClick={() => setShowForm(true)}>
        Add New Offer
      </button>
      {showForm && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={() => setShowForm(false)}>
              &times;
            </span>
            <div className="form-group">
              <label htmlFor="itemName">Item Name:</label>
              <input
                type="text"
                id="itemName"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="actualPrice">Actual Price:</label>
              <input
                type="text"
                id="actualPrice"
                value={actualPrice}
                onChange={(e) => setActualPrice(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="discountPercentage">Discount Percentage:</label>
              <input
                type="text"
                id="discountPercentage"
                value={discountPercentage}
                onChange={(e) => setDiscountPercentage(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="offerDescription">Offer Description:</label>
              <input
                type="text"
                id="offerDescription"
                value={offerDescription}
                onChange={(e) => setOfferDescription(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="image">Image:</label>
              <input
                type="file"
                id="image"
                onChange={(e) => setImageFile(e.target.files[0])}
              />
            </div>
            <div className="form-group">
              <label htmlFor="priceAfterDiscount">Price After Discount:</label>
              <input
                type="text"
                id="priceAfterDiscount"
                value={calculatePriceAfterDiscount()}
                readOnly
              />
            </div>
            <button className="add-button" onClick={handleAddOffer}>
              {editOfferId ? 'Update Offer' : 'Add New Offer'}
            </button>
          </div>
        </div>
      )}
      <h3>Offers</h3>
      <table className="offers-table">
        <thead>
          <tr>
            <th>Item Name</th>
            <th>Actual Price</th>
            <th>Discount Percentage</th>
            <th>Offer Description</th>
            <th>Price After Discount</th>
            <th>Image</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {offers.map((offer, index) => (
            <tr key={index}>
              <td>{offer.itemName}</td>
              <td>QAR {offer.actualPrice}</td>
              <td>{offer.discountPercentage}%</td>
              <td>{offer.offerDescription}</td>
              <td>QAR {offer.price}</td>
              <td>
                {offer.image ? (
                  <img
                    src={offer.image}
                    alt={offer.itemName}
                    className="item-image"
                  />
                ) : (
                  <span className="image-placeholder">No Image Available</span>
                )}
              </td>
              <td>
                <button className="edit-button" onClick={() => handleEdit(offer)}>
                  Edit
                </button>
                <button
                  className="delete-button"
                  onClick={() => handleDeleteConfirm(offer.id)}
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
            <h4>Confirm Delete</h4>
            <p>Are you sure you want to delete this offer?</p>
            <button className="confirm-delete-button" onClick={handleDelete}>
              Confirm Delete
            </button>
            <button className="cancel-button" onClick={() => setShowDeleteConfirm(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SpecialOffers;
