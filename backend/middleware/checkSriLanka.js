// middleware/checkSriLanka.js
module.exports = function ensureSriLankaOrCancel(orderBody) {
  const country = (orderBody.country || '').trim().toLowerCase();
  const isSriLanka = country === 'sri lanka' || country === 'srilanka' || country === 'sri-lanka';
  return isSriLanka;
};
