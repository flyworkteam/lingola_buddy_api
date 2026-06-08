/** Misafir kullanıcı e-postası: guest_XXXXX@lingolabuddy.com (5 haneli rastgele sayı) */
function generateGuestEmail() {
  const digits = Math.floor(Math.random() * 100000)
    .toString()
    .padStart(5, '0');
  return `guest_${digits}@lingolabuddy.com`;
}

module.exports = { generateGuestEmail };
