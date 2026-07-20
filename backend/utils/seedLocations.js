const User = require('../models/User');
const Hospital = require('../models/Hospital');
const BloodBank = require('../models/BloodBank');
const bcrypt = require('bcryptjs');

const CITIES = {
  'Delhi': { lat: 28.7041, lng: 77.1025 },
  'Mumbai': { lat: 19.0760, lng: 72.8777 },
  'Bengaluru': { lat: 12.9716, lng: 77.5946 },
  'Prayagraj': { lat: 25.4358, lng: 81.8463 },
  'Lucknow': { lat: 26.8467, lng: 80.9462 },
  'Kanpur': { lat: 26.4499, lng: 80.3319 },
  'Mathura': { lat: 27.4924, lng: 77.6737 },
  'Agra': { lat: 27.1767, lng: 78.0081 },
  'Noida': { lat: 28.5355, lng: 77.3910 },
  'Varanasi': { lat: 25.3176, lng: 82.9739 }
};

const HOSPITAL_NAMES = [
  'City General Hospital', 'Apollo Hospital', 'Max Healthcare', 'Fortis Hospital',
  'Medanta Hospital', 'AIIMS', 'Sanjay Gandhi Hospital', 'District Hospital',
  'Life Care Hospital', 'Shri Ram Hospital', 'Metro Hospital', 'Janak Hospital',
  'Sparsh Hospital', 'Noble Hospital', 'Prime Hospital', 'Ashoka Hospital',
  'New Life Hospital', 'Sahyog Hospital', 'Om Hospital', 'Goyal Hospital'
];

const BLOOD_BANK_NAMES = [
  'Red Cross Blood Bank', 'LifeLine Blood Bank', 'Sankalp Blood Bank', 'Raktadan Blood Bank',
  'Jeevan Blood Bank', 'Swasthya Blood Bank', 'Arogya Blood Bank', 'Sanjeevani Blood Bank',
  'Blood Donation Centre', 'Rakta Kosh Blood Bank', 'Sudha Blood Bank', 'Nidan Blood Bank',
  'Krishna Blood Bank', 'Shivam Blood Bank', 'Prakriti Blood Bank'
];

const CONTACTS = [
  '+91-9876543210', '+91-9876543211', '+91-9876543212', '+91-9876543213',
  '+91-9876543214', '+91-9876543215', '+91-9876543216', '+91-9876543217'
];

const getState = (city) => {
  if (city === 'Delhi' || city === 'Noida') return 'Delhi';
  if (city === 'Mumbai') return 'Maharashtra';
  if (city === 'Bengaluru') return 'Karnataka';
  return 'Uttar Pradesh';
};

const generateInventory = () => ({
  'A+': Math.floor(Math.random() * 20) + 5,
  'A-': Math.floor(Math.random() * 10) + 2,
  'B+': Math.floor(Math.random() * 20) + 5,
  'B-': Math.floor(Math.random() * 10) + 2,
  'AB+': Math.floor(Math.random() * 10) + 1,
  'AB-': Math.floor(Math.random() * 5) + 1,
  'O+': Math.floor(Math.random() * 25) + 10,
  'O-': Math.floor(Math.random() * 10) + 3
});

const seedLocations = async () => {
  try {
    const existingBB = await BloodBank.countDocuments();
    const existingHosp = await Hospital.countDocuments();
    console.log(`[Seed] Existing data — BloodBanks: ${existingBB}, Hospitals: ${existingHosp}`);

    if (existingBB >= 10 && existingHosp >= 15) {
      console.log('[Seed] Sufficient data exists, skipping');
      return;
    }

    const cities = Object.keys(CITIES);

    for (const city of cities) {
      const coords = CITIES[city];
      const shuffledHospitals = [...HOSPITAL_NAMES].sort(() => Math.random() - 0.5);
      const shuffledBB = [...BLOOD_BANK_NAMES].sort(() => Math.random() - 0.5);

      for (let i = 0; i < 3; i++) {
        const email = `hospital.${city.toLowerCase().replace(/\s/g, '')}${i}@lifeflow.test`;
        let user = await User.findOne({ email });
        if (!user) {
          user = await User.create({
            name: shuffledHospitals[i],
            email,
            password: 'Hospital@123',
            role: 'hospital',
            phone: CONTACTS[(i + cities.indexOf(city) * 3) % CONTACTS.length],
            city,
            isVerified: true,
            isActive: true
          });
          console.log(`[Seed] Created user for hospital: ${shuffledHospitals[i]} (${city})`);
        }

        const existing = await Hospital.findOne({ hospitalName: shuffledHospitals[i], city });
        if (!existing) {
          await Hospital.create({
            user: user._id,
            hospitalName: shuffledHospitals[i],
            address: `${Math.floor(Math.random() * 500) + 1}, Main Road, ${city}`,
            city,
            contactNumber: CONTACTS[(i + cities.indexOf(city) * 3) % CONTACTS.length],
            bloodInventory: generateInventory(),
            isVerified: true,
            location: {
              type: 'Point',
              coordinates: [coords.lng + (Math.random() - 0.5) * 0.05, coords.lat + (Math.random() - 0.5) * 0.05]
            }
          });
          console.log(`[Seed] Created hospital: ${shuffledHospitals[i]} (${city})`);
        }
      }

      for (let i = 0; i < 2; i++) {
        const existing = await BloodBank.findOne({ name: shuffledBB[i], city });
        if (!existing) {
          await BloodBank.create({
            name: shuffledBB[i],
            address: `${Math.floor(Math.random() * 300) + 1}, Station Road, ${city}`,
            city,
            state: getState(city),
            pincode: String(100000 + Math.floor(Math.random() * 900000)),
            contactNumber: CONTACTS[(i + cities.indexOf(city) * 2) % CONTACTS.length],
            isVerified: true,
            isOpen24x7: Math.random() > 0.5,
            openingHours: '9:00 AM - 6:00 PM',
            emergencyAvailable: Math.random() > 0.3,
            bloodInventory: generateInventory(),
            location: {
              type: 'Point',
              coordinates: [coords.lng + (Math.random() - 0.5) * 0.05, coords.lat + (Math.random() - 0.5) * 0.05]
            }
          });
          console.log(`[Seed] Created blood bank: ${shuffledBB[i]} (${city})`);
        }
      }
    }

    const finalBB = await BloodBank.countDocuments();
    const finalHosp = await Hospital.countDocuments();
    console.log(`[Seed] Done — BloodBanks: ${finalBB}, Hospitals: ${finalHosp}`);
  } catch (error) {
    console.error('[Seed] Fatal error:', error);
  }
};

module.exports = seedLocations;
