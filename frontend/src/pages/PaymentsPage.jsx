import React, { useEffect, useState } from 'react';
import { getUserPayments, updateSavedCard, deleteSavedCard } from '../services/paymentService';
import { useNavigate } from 'react-router-dom';

export default function PaymentsPage() {
  const [savedCards, setSavedCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updateCard, setUpdateCard] = useState(null); // For updating a specific card
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    cardHolder: '',
    expiry: '',
    cvv: ''
  });
  const navigate = useNavigate();

  // Fetch saved cards on mount
  useEffect(() => {
    (async () => {
      try {
        const { payments } = await getUserPayments();
        // Filter payments to only those with saved card details
        const saved = payments.filter(payment => payment.cardDetails?.saved === true);
        setSavedCards(saved);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load saved cards. Please try again.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Handle update card form submission
  const handleUpdateCard = async (paymentId) => {
    try {
      if (!cardDetails.cardNumber || cardDetails.cardNumber.length < 4) {
        setError('Please enter a valid card number.');
        return;
      }
      await updateSavedCard(paymentId, {
        cardDetails: {
          lastFourDigits: cardDetails.cardNumber.slice(-4),
          expiry: cardDetails.expiry,
          cardHolder: cardDetails.cardHolder,
          saved: true
        }
      });
      // Update local state
      setSavedCards(savedCards.map(card =>
        card._id === paymentId
          ? {
              ...card,
              cardDetails: {
                lastFourDigits: cardDetails.cardNumber.slice(-4),
                expiry: cardDetails.expiry,
                cardHolder: cardDetails.cardHolder,
                saved: true
              }
            }
          : card
      ));
      setUpdateCard(null);
      setCardDetails({ cardNumber: '', cardHolder: '', expiry: '', cvv: '' });
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update card. Please try again.');
    }
  };

  // Handle delete card
  const handleDeleteCard = async (paymentId) => {
    try {
      await deleteSavedCard();
      setSavedCards(savedCards.filter(card => card._id !== paymentId));
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete card. Please try again.');
    }
  };

  // Populate update form with existing card details
  const startUpdate = (card) => {
    setUpdateCard(card._id);
    setCardDetails({
      cardNumber: `**** **** **** ${card.cardDetails?.lastFourDigits || ''}`,
      cardHolder: card.cardDetails?.cardHolder || '',
      expiry: card.cardDetails?.expiry || '',
      cvv: ''
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-white flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-lg">
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 border-3 border-pink-300 border-t-pink-600 rounded-full animate-spin"></div>
            <p className="text-gray-600 font-medium">Loading your saved cards...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-pink-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Manage Saved Cards</h1>
          <p className="text-gray-600">View, update, or delete your saved payment cards</p>
          <div className="w-24 h-1 bg-gradient-to-r from-pink-400 to-pink-600 mx-auto mt-4 rounded-full"></div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <span className="text-red-700 font-medium">{error}</span>
            </div>
          </div>
        )}

        {savedCards.length === 0 ? (
          <div className="bg-white p-6 rounded-2xl shadow-xl border border-pink-100 text-center">
            <p className="text-gray-600">No saved cards found.</p>
            <button
              onClick={() => navigate('/checkout')}
              className="mt-4 px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors duration-200"
            >
              Add a Card at Checkout
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {savedCards.map(card => (
              <div key={card._id} className="bg-white p-6 rounded-2xl shadow-xl border border-pink-100">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-gray-800">Card: **** **** **** {card.cardDetails?.lastFourDigits || 'N/A'}</p>
                    <p className="text-sm text-gray-600">Card Holder: {card.cardDetails?.cardHolder || 'N/A'}</p>
                    <p className="text-sm text-gray-600">Expiry: {card.cardDetails?.expiry || 'N/A'}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => startUpdate(card)}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200"
                    >
                      Update
                    </button>
                    <button
                      onClick={() => handleDeleteCard(card._id)}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Update Card Modal */}
        {updateCard && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50">
            <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-xl">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-pink-700">Update Saved Card</h2>
                <button
                  onClick={() => setUpdateCard(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
                  <input
                    className="w-full px-4 py-2 border border-pink-200 rounded-lg focus:ring-pink-500 focus:border-pink-500"
                    placeholder="1234 5678 9012 3456"
                    value={cardDetails.cardNumber}
                    onChange={e => setCardDetails({ ...cardDetails, cardNumber: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name on Card</label>
                  <input
                    className="w-full px-4 py-2 border border-pink-200 rounded-lg focus:ring-pink-500 focus:border-pink-500"
                    placeholder="John Doe"
                    value={cardDetails.cardHolder}
                    onChange={e => setCardDetails({ ...cardDetails, cardHolder: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                    <input
                      className="w-full px-4 py-2 border border-pink-200 rounded-lg focus:ring-pink-500 focus:border-pink-500"
                      placeholder="MM/YY"
                      value={cardDetails.expiry}
                      onChange={e => setCardDetails({ ...cardDetails, expiry: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">CVV</label>
                    <input
                      className="w-full px-4 py-2 border border-pink-200 rounded-lg focus:ring-pink-500 focus:border-pink-500"
                      placeholder="123"
                      value={cardDetails.cvv}
                      onChange={e => setCardDetails({ ...cardDetails, cvv: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-2 mt-6">
                <button
                  onClick={() => handleUpdateCard(updateCard)}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => setUpdateCard(null)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}