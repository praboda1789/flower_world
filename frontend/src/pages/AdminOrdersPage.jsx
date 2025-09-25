// pages/AdminOrdersPage.jsx
import React, { useEffect, useState } from 'react';
import { getAllOrdersAdmin } from '../services/orderService';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  useEffect(()=>{ (async ()=> {
    try {
      const res = await getAllOrdersAdmin();
      setOrders(res.orders || []);
    } catch (e) {
      console.error(e);
    }
  })(); }, []);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">All Orders (Admin)</h1>
      <div className="bg-white rounded shadow p-4">
        {orders.map(o => (
          <div key={o._id} className="border-b py-3">
            <div className="flex justify-between items-start">
              <div>
                <div className="font-semibold">#{o._id} - {o.toName} ({o.city})</div>
                <div className="text-sm">From: {o.fromName} | Phone: {o.phone}</div>
                <div className="text-sm">Status: {o.status} | Total: LKR {o.total}</div>
                <div className="text-sm text-gray-600">Ordered: {new Date(o.createdAt).toLocaleString()}</div>
              </div>
              <div>
                <button onClick={()=>window.open(`/admin/orders/${o._id}`, '_blank')} className="px-3 py-1 border rounded">View</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
