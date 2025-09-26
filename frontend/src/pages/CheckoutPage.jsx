import React, { useEffect, useState } from 'react';
import { getCart } from '../services/cartService';
import { createOrder } from '../services/orderService';
import { createPayment, getSavedCard, updateSavedCard, deleteSavedCard } from '../services/paymentService';
import { useNavigate } from 'react-router-dom';

export default function CheckoutPage() {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    fromName: '',
    toName: '',
    message: '',
    phone: '',
    addressLine: '',
    city: '',
    district: '',
    postalCode: '',
    country: 'Sri Lanka',
    deliveryDate: '',
    paymentMethod: 'card'
  });
  const [error, setError] = useState(null);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [saveCard, setSaveCard] = useState(false);
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    cardHolder: '',
    expiry: '',
    cvv: ''
  });
  const [savedCard, setSavedCard] = useState(null);
  const [showUpdateCard, setShowUpdateCard] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const data = await getCart();
        setCart(data.items || []);
        const savedCardData = await getSavedCard();
        setSavedCard(savedCardData.card);
      } catch (e) {
        setError('Unable to load cart or saved card.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const total = cart.reduce((s, i) => s + (i.price || 0) * i.quantity, 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!form.fromName || !form.toName || !form.phone || !form.addressLine || !form.city) {
      setError('Please fill required fields.');
      return;
    }
    if (form.country !== 'Sri Lanka') {
      setError('We only deliver to Sri Lanka.');
      return;
    }

    setShowPayment(true);
  };

  const confirmPayment = async () => {
    try {
      const payload = { ...form, deliveryDate: form.deliveryDate || null, items: cart, total };
      const { order, warning } = await createOrder(payload);
      if (warning) {
        alert(warning);
        setShowPayment(false);
        navigate('/orders/:id');
        return;
      }

      console.log('Order ID:', order._id);
      const payment = await createPayment({
        orderId: order._id,
        amount: total,
        method: 'card',
        cardDetails: saveCard ? {
          lastFourDigits: cardDetails.cardNumber.slice(-4),
          expiry: cardDetails.expiry,
          cardHolder: cardDetails.cardHolder,
          saved: true
        } : {}
      });

      setShowPayment(false);
      setPaymentCompleted(true);
      setTimeout(() => navigate('/orders/:id'), 2000);
    } catch (err) {
      console.error('Checkout error:', {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data
      });
      setError(err.response?.data?.message || 'Failed to place order or save payment.');
      setShowPayment(false);
    }
  };

  const handleUpdateCard = async () => {
    try {
      const savedCardData = await getSavedCard();
      if (!savedCardData.card) {
        setError('No saved card found');
        return;
      }

      const paymentId = savedCardData.card.paymentId; // Assuming backend returns paymentId with saved card
      if (!paymentId) {
        setError('Saved card data is incomplete');
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

      setSavedCard({
        lastFourDigits: cardDetails.cardNumber.slice(-4),
        expiry: cardDetails.expiry,
        cardHolder: cardDetails.cardHolder,
        saved: true
      });
      setShowUpdateCard(false);
      setError(null);
    } catch (err) {
      console.error('Update card error:', err);
      setError(err.response?.data?.message || 'Failed to update card details.');
    }
  };

  const handleDeleteCard = async () => {
    try {
      await deleteSavedCard();
      setSavedCard(null);
      setError(null);
    } catch (err) {
      console.error('Delete card error:', err);
      setError(err.response?.data?.message || 'Failed to delete saved card.');
    }
  };

  const useSavedCard = () => {
    if (savedCard) {
      setCardDetails({
        cardNumber: `**** **** **** ${savedCard.lastFourDigits}`,
        cardHolder: savedCard.cardHolder,
        expiry: savedCard.expiry,
        cvv: ''
      });
      setSaveCard(true);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-white flex items-center justify-center">
      <div className="bg-white p-8 rounded-2xl shadow-lg">
        <div className="flex items-center space-x-3">
          <div className="w-6 h-6 border-3 border-pink-300 border-t-pink-600 rounded-full animate-spin"></div>
          <p className="text-gray-600 font-medium">Loading your order...</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-pink-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Checkout</h1>
          <p className="text-gray-600">Complete your beautiful flower order</p>
          <div className="w-24 h-1 bg-gradient-to-r from-pink-400 to-pink-600 mx-auto mt-4 rounded-full"></div>
        </div>

        <div className="grid lg:grid-cols-5 gap-8">
          <div className="lg:col-span-2 lg:order-2">
            <div className="bg-white rounded-2xl shadow-xl border border-pink-100 sticky top-8">
              <div className="p-6 border-b border-pink-100">
                <h2 className="text-xl font-bold text-gray-800 flex items-center">
                  <svg className="w-6 h-6 text-pink-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
                  </svg>
                  Order Summary
                </h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {cart.map(i => (
                    <div key={i.flowerId} className="flex justify-between items-start p-4 bg-pink-50 rounded-xl border border-pink-100">
                      <div className="flex-1">
                        <div className="font-semibold text-gray-800">{i.name}</div>
                        <div className="text-sm text-pink-600 font-medium">Size: {i.size}</div>
                        <div className="text-sm text-gray-500">Quantity: {i.quantity}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-gray-800">LKR {i.price * i.quantity}</div>
                        <div className="text-xs text-gray-500">LKR {i.price} each</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="border-t border-pink-200 mt-6 pt-6">
                  <div className="bg-gradient-to-r from-pink-500 to-pink-600 text-white p-4 rounded-xl">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold">Total Amount</span>
                      <span className="text-2xl font-bold">LKR {total}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-3 lg:order-1">
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl border border-pink-100">
              <div className="p-6 border-b border-pink-100">
                <h2 className="text-xl font-bold text-gray-800 flex items-center">
                  <svg className="w-6 h-6 text-pink-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                  </svg>
                  Order Details
                </h2>
              </div>

              <div className="p-6">
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

                {/* Saved Card Section */}
                {savedCard && (
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                      <svg
                        className="w-5 h-5 text-pink-500 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                        ></path>
                      </svg>
                      Saved Card
                    </h3>

                    <div className="p-4 bg-pink-50 rounded-xl border border-pink-200">
                      <p className="text-sm text-gray-600">
                        Card: **** **** **** {savedCard.lastFourDigits}
                      </p>
                      <p className="text-sm text-gray-600">Card Holder: {savedCard.cardHolder}</p>
                      <p className="text-sm text-gray-600">Expiry: {savedCard.expiry}</p>

                      {/* Checkbox */}
                      <div className="mt-4">
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={saveCard}
                            onChange={(e) => {
                              if (e.target.checked) {
                                useSavedCard();
                              } else {
                                setSaveCard(false);
                                setCardDetails({
                                  cardNumber: "",
                                  cardHolder: "",
                                  expiry: "",
                                  cvv: "",
                                });
                              }
                            }}
                            className="w-5 h-5 text-pink-600 border-gray-300 rounded focus:ring-pink-500"
                          />
                          <span className="text-gray-700">Use This Saved Card</span>
                        </label>
                      </div>

                      {/* Buttons */}
                      <div className="flex gap-4 mt-4">
                        <button
                          type="button"
                          onClick={() => setShowUpdateCard(true)}
                          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                        >
                          Update Card
                        </button>
                        <button
                          type="button"
                          onClick={handleDeleteCard}
                          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                        >
                          Delete Card
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Personal Information */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <svg className="w-5 h-5 text-pink-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                    </svg>
                    Personal Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">From Name *</label>
                      <input
                        type="text"
                        placeholder="Your name"
                        value={form.fromName}
                        onChange={e => setForm({ ...form, fromName: e.target.value })}
                        required
                        className="w-full p-3 border border-pink-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200 bg-pink-50 focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">To Name *</label>
                      <input
                        type="text"
                        placeholder="Recipient's name"
                        value={form.toName}
                        onChange={e => setForm({ ...form, toName: e.target.value })}
                        required
                        className="w-full p-3 border border-pink-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200 bg-pink-50 focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                      <input
                        type="tel"
                        placeholder="+94 XX XXX XXXX"
                        value={form.phone}
                        onChange={e => setForm({ ...form, phone: e.target.value })}
                        required
                        className="w-full p-3 border border-pink-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200 bg-pink-50 focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Date</label>
                      <input
                        type="date"
                        value={form.deliveryDate}
                        onChange={e => setForm({ ...form, deliveryDate: e.target.value })}
                        className="w-full p-3 border border-pink-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200 bg-pink-50 focus:bg-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Delivery Address */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <svg className="w-5 h-5 text-pink-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    </svg>
                    Delivery Address
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Address Line *</label>
                      <input
                        type="text"
                        placeholder="Street address, building, apartment"
                        value={form.addressLine}
                        onChange={e => setForm({ ...form, addressLine: e.target.value })}
                        required
                        className="w-full p-3 border border-pink-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200 bg-pink-50 focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
                      <input
                        type="text"
                        placeholder="City"
                        value={form.city}
                        onChange={e => setForm({ ...form, city: e.target.value })}
                        required
                        className="w-full p-3 border border-pink-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200 bg-pink-50 focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">District</label>
                      <input
                        type="text"
                        placeholder="District (optional)"
                        value={form.district}
                        onChange={e => setForm({ ...form, district: e.target.value })}
                        className="w-full p-3 border border-pink-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200 bg-pink-50 focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Postal Code</label>
                      <input
                        type="text"
                        placeholder="Postal code"
                        value={form.postalCode}
                        onChange={e => setForm({ ...form, postalCode: e.target.value })}
                        className="w-full p-3 border border-pink-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200 bg-pink-50 focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                      <select
                        value={form.country}
                        onChange={e => setForm({ ...form, country: e.target.value })}
                        className="w-full p-3 border border-pink-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200 bg-pink-50 focus:bg-white"
                      >
                        <option value="Sri Lanka">Sri Lanka</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Love Message */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <svg className="w-5 h-5 text-pink-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                    </svg>
                    Love Message
                  </h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Personal Message (Optional)</label>
                    <textarea
                      placeholder="Add a heartfelt message to make this gift even more special..."
                      value={form.message}
                      onChange={e => setForm({ ...form, message: e.target.value })}
                      rows="4"
                      className="w-full p-3 border border-pink-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200 bg-pink-50 focus:bg-white resize-none"
                    />
                  </div>
                </div>

                {/* Payment Method */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <svg className="w-5 h-5 text-pink-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
                    </svg>
                    Payment Method
                  </h3>
                  <div className="p-4 bg-pink-50 rounded-xl border border-pink-200">
                    <div className="flex items-center">
                      <svg className="w-6 h-6 text-pink-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
                      </svg>
                      <span className="font-medium text-gray-800">Card Payment</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-2 ml-9">Enter payment details on the next step</p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-pink-100">
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-pink-500 to-pink-600 text-white font-semibold py-4 px-6 rounded-xl hover:from-pink-600 hover:to-pink-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    Proceed to Payment
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('/cart')}
                    className="flex-1 sm:flex-initial bg-white text-pink-600 font-semibold py-4 px-6 rounded-xl border-2 border-pink-200 hover:bg-pink-50 hover:border-pink-300 transition-all duration-200 flex items-center justify-center"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
                    </svg>
                    Back to Cart
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPayment && !paymentCompleted && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50">
          <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-pink-700">Demo Payment</h2>
              <button
                onClick={() => setShowPayment(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="bg-pink-50 p-4 rounded-lg mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">Order Total:</span>
                <span className="font-bold text-pink-700">LKR {total}</span>
              </div>
              <p className="text-sm text-pink-600">This is a demo payment. No real transaction will occur.</p>
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
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={saveCard}
                    onChange={e => setSaveCard(e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Save card details for future use</span>
                </label>
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={confirmPayment}
                className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200"
              >
                Confirm Payment
              </button>
              <button
                onClick={() => setShowPayment(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Update Card Modal */}
      {showUpdateCard && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50">
          <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-pink-700">Update Saved Card</h2>
              <button
                onClick={() => setShowUpdateCard(false)}
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
                onClick={handleUpdateCard}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
              >
                Save Changes
              </button>
              <button
                onClick={() => setShowUpdateCard(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Completed Modal */}
      {paymentCompleted && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50">
          <div className="bg-white p-8 rounded-xl shadow-xl text-center max-w-md w-full">
            <svg className="w-16 h-16 text-green-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Payment Completed!</h2>
            <p className="text-gray-600 mb-6">Your order has been placed successfully. Redirecting to your orders...</p>
            <div className="w-12 h-12 border-3 border-green-300 border-t-green-600 rounded-full animate-spin mx-auto"></div>
          </div>
        </div>
      )}
    </div>
  );
}