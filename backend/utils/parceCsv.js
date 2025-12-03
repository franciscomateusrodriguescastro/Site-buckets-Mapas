// backend/utils/parseCsv.js
function parseCsv(text) {
  const lines = text.split(/\r?\n/).filter(Boolean);
  const headers = lines.shift().split(',').map(h => h.trim());
  return lines.map(line => {
    const cols = line.split(',').map(c => c.trim());
    const obj = {};
    headers.forEach((h, i) => obj[h] = cols[i] || '');
    // tente converter lat/lng para números
    if (obj.latitude) obj.latitude = parseFloat(obj.latitude);
    if (obj.longitude) obj.longitude = parseFloat(obj.longitude);
    return obj;
  });
}

module.exports = { parseCsv };
