// import React, { useEffect, useState } from "react";
// import { getDeliveries } from "../services/deliveryService";

// const MyDeliveries = ({ userId }) => {
//   const [deliveries, setDeliveries] = useState([]);

//   useEffect(() => {
//     const fetchDeliveries = async () => {
//       const data = await getDeliveries();
//       // ✅ Filter deliveries that belong to this user's orders
//       const myDeliveries = data.filter((d) => d.orderId?.userId === userId);
//       setDeliveries(myDeliveries);
//     };
//     fetchDeliveries();
//   }, [userId]);

//   return (
//     <div className="container">
//       <h2>My Deliveries</h2>
//       {deliveries.length === 0 ? (
//         <p>No deliveries found.</p>
//       ) : (
//         <ul>
//           {deliveries.map((d) => (
//             <li key={d._id}>
//               <strong>{d.recipientName}</strong> - {d.address} ({d.status})
//             </li>
//           ))}
//         </ul>
//       )}
//     </div>
//   );
// };

// export default MyDeliveries;
