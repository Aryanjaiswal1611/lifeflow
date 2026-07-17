const DonationCamp = require('../models/DonationCamp');
const Donor = require('../models/Donor');
const Notification = require('../models/Notification');
const { calculateDistance } = require('../utils/bloodMatch');

const seedSampleCamps = async () => {
  const count = await DonationCamp.countDocuments();
  if (count > 0) return false;

  const now = new Date();
  const sampleCamps = [
    {
      campName: 'Red Cross Mega Blood Drive',
      organizer: 'Indian Red Cross Society',
      organizerContact: '011-23711592',
      date: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000),
      time: '09:00',
      address: '1 Red Cross Road',
      city: 'Delhi',
      state: 'Delhi',
      pincode: '110001',
      bloodGroupsNeeded: ['O-', 'O+', 'B-', 'A+'],
      contactNumber: '+91-9876543210',
      email: 'delhi@redcross.in',
      maxParticipants: 200,
      registeredCount: 45,
      status: 'approved',
      isApproved: true,
      description: 'Annual mega blood donation camp organized by Indian Red Cross Society.'
    },
    {
      campName: 'LifeFlow Community Camp',
      organizer: 'LifeFlow Foundation',
      organizerContact: '022-23456789',
      date: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
      time: '10:00',
      address: 'Andheri West, Near Metro Station',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400053',
      bloodGroupsNeeded: ['A+', 'A-', 'O+', 'AB+'],
      contactNumber: '+91-9988776655',
      email: 'mumbai@lifeflow.org',
      maxParticipants: 150,
      registeredCount: 78,
      status: 'approved',
      isApproved: true,
      description: 'Community blood donation drive for local residents.'
    },
    {
      campName: 'Rotary Club Blood Donation',
      organizer: 'Rotary Club Bangalore',
      organizerContact: '080-22334455',
      date: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
      time: '08:30',
      address: 'MG Road, Rotary House',
      city: 'Bangalore',
      state: 'Karnataka',
      pincode: '560001',
      bloodGroupsNeeded: ['B+', 'B-', 'O-', 'AB-', 'A+'],
      contactNumber: '+91-8899776655',
      email: 'bangalore@rotary.org',
      maxParticipants: 120,
      registeredCount: 30,
      status: 'pending',
      isApproved: false,
      description: 'Rotary Club monthly blood donation campaign.'
    },
    {
      campName: 'Lions Club Health Camp',
      organizer: 'Lions Club Chennai',
      organizerContact: '044-25678901',
      date: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
      endDate: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000),
      time: '07:00',
      address: 'T Nagar, Pondy Bazaar',
      city: 'Chennai',
      state: 'Tamil Nadu',
      pincode: '600017',
      bloodGroupsNeeded: ['A+', 'B+', 'O+', 'AB+'],
      contactNumber: '+91-7788996655',
      email: 'chennai@lionsclubs.in',
      maxParticipants: 100,
      registeredCount: 92,
      status: 'active',
      isApproved: true,
      description: 'Multi-day health camp with blood donation drive.'
    },
    {
      campName: 'TechCorp CSR Blood Drive',
      organizer: 'TechCorp India Ltd',
      organizerContact: '040-33445566',
      date: new Date(now.getTime() + 45 * 24 * 60 * 60 * 1000),
      time: '09:30',
      address: 'Hi-Tech City, Cyber Towers',
      city: 'Hyderabad',
      state: 'Telangana',
      pincode: '500081',
      bloodGroupsNeeded: ['O-', 'O+', 'A-', 'B-', 'AB-'],
      contactNumber: '+91-6655443322',
      email: 'csr@techcorp.com',
      maxParticipants: 300,
      registeredCount: 15,
      status: 'pending',
      isApproved: false,
      description: 'Corporate social responsibility initiative - annual blood donation camp.'
    },
    {
      campName: 'AIIMS Emergency Blood Camp',
      organizer: 'AIIMS Hospital',
      organizerContact: '011-26588500',
      date: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
      endDate: new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000),
      time: '08:00',
      address: 'Ansari Nagar East',
      city: 'Delhi',
      state: 'Delhi',
      pincode: '110029',
      bloodGroupsNeeded: ['O-', 'O+', 'A+', 'B+', 'AB+'],
      contactNumber: '+91-9911223344',
      email: 'bloodbank@aiims.edu',
      maxParticipants: 250,
      registeredCount: 250,
      status: 'completed',
      isApproved: true,
      description: 'Emergency blood donation camp in response to seasonal demand.'
    },
    {
      campName: 'Youth Red Cross Campus Drive',
      organizer: 'Youth Red Cross - DU',
      organizerContact: '011-27667788',
      date: new Date(now.getTime() + 21 * 24 * 60 * 60 * 1000),
      time: '10:00',
      address: 'Delhi University North Campus',
      city: 'Delhi',
      state: 'Delhi',
      pincode: '110007',
      bloodGroupsNeeded: ['A+', 'B+', 'O+', 'AB+', 'O-'],
      contactNumber: '+91-8877665544',
      email: 'yrc@du.ac.in',
      maxParticipants: 180,
      registeredCount: 60,
      status: 'approved',
      isApproved: true,
      description: 'University campus blood donation drive for students and faculty.'
    },
    {
      campName: 'Apollo Hospital Blood Bank Camp',
      organizer: 'Apollo Hospitals',
      organizerContact: '044-28290200',
      date: new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000),
      time: '06:00',
      address: '21 Greams Lane, Off Greams Road',
      city: 'Chennai',
      state: 'Tamil Nadu',
      pincode: '600006',
      bloodGroupsNeeded: ['A-', 'B-', 'AB-', 'O-'],
      contactNumber: '+91-7766554433',
      email: 'bloodservices@apollohospitals.com',
      maxParticipants: 100,
      registeredCount: 10,
      status: 'pending',
      isApproved: false,
      description: 'Rare blood group collection drive - special focus on negative blood groups.'
    }
  ];

  await DonationCamp.insertMany(sampleCamps);
  console.log(`Seeded ${sampleCamps.length} sample donation camps`);
  return true;
};

const getNearbyCamps = async (req, res) => {
  try {
    const { lat, lng, maxDistance = 100, city, state } = req.query;
    let query = { status: { $in: ['approved', 'active'] } };
    if (city) query.city = { $regex: city, $options: 'i' };
    if (state) query.state = { $regex: state, $options: 'i' };
    let camps = await DonationCamp.find(query).sort({ date: 1 }).lean();
    if (lat && lng) {
      const maxDist = parseFloat(maxDistance);
      camps = camps.map(c => ({
        ...c,
        distance: calculateDistance([parseFloat(lng), parseFloat(lat)], c.location?.coordinates || [0, 0])
      })).filter(c => c.distance <= maxDist).sort((a, b) => a.distance - b.distance);
    }
    res.json(camps);
  } catch (error) {
    console.error('getNearbyCamps error:', error.message);
    res.status(500).json({ message: error.message });
  }
};

const getCampById = async (req, res) => {
  try {
    const camp = await DonationCamp.findById(req.params.id).populate('registeredDonors');
    if (!camp) return res.status(404).json({ message: 'Camp not found' });
    res.json(camp);
  } catch (error) {
    console.error('getCampById error:', error.message);
    res.status(500).json({ message: error.message });
  }
};

const getAllCamps = async (req, res) => {
  try {
    const camps = await DonationCamp.find().populate('organizedBy', 'name email').sort({ date: -1 });
    res.json(camps);
  } catch (error) {
    console.error('getAllCamps error:', error.message, error.stack);
    res.status(500).json({ message: error.message });
  }
};

const createCamp = async (req, res) => {
  try {
    const campData = { ...req.body, organizedBy: req.user._id };
    if (campData.lat && campData.lng) {
      campData.location = { type: 'Point', coordinates: [parseFloat(campData.lng), parseFloat(campData.lat)] };
    }
    const camp = await DonationCamp.create(campData);
    res.status(201).json(camp);
  } catch (error) {
    console.error('createCamp error:', error.message);
    res.status(500).json({ message: error.message });
  }
};

const updateCamp = async (req, res) => {
  try {
    const camp = await DonationCamp.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!camp) return res.status(404).json({ message: 'Camp not found' });
    res.json(camp);
  } catch (error) {
    console.error('updateCamp error:', error.message);
    res.status(500).json({ message: error.message });
  }
};

const registerForCamp = async (req, res) => {
  try {
    const camp = await DonationCamp.findById(req.params.id);
    if (!camp) return res.status(404).json({ message: 'Camp not found' });
    if (camp.status !== 'approved' && camp.status !== 'active') {
      return res.status(400).json({ message: 'Camp is not accepting registrations' });
    }
    if (camp.registeredCount >= camp.maxParticipants) {
      return res.status(400).json({ message: 'Camp is full' });
    }
    const donor = await Donor.findOne({ user: req.user._id });
    if (!donor) return res.status(404).json({ message: 'Donor profile not found' });
    if (camp.registeredDonors?.some(d => d.toString() === donor._id.toString())) {
      return res.status(400).json({ message: 'Already registered for this camp' });
    }
    if (!camp.registeredDonors) camp.registeredDonors = [];
    camp.registeredDonors.push(donor._id);
    camp.registeredCount = (camp.registeredCount || 0) + 1;
    await camp.save();
    res.json({ message: 'Registered successfully', camp });
  } catch (error) {
    console.error('registerForCamp error:', error.message);
    res.status(500).json({ message: error.message });
  }
};

const approveCamp = async (req, res) => {
  try {
    const camp = await DonationCamp.findByIdAndUpdate(
      req.params.id,
      { status: 'approved', isApproved: true, approvedBy: req.user._id },
      { new: true }
    );
    if (!camp) return res.status(404).json({ message: 'Camp not found' });
    res.json({ message: 'Camp approved', camp });
  } catch (error) {
    console.error('approveCamp error:', error.message);
    res.status(500).json({ message: error.message });
  }
};

const rejectCamp = async (req, res) => {
  try {
    const camp = await DonationCamp.findByIdAndUpdate(
      req.params.id,
      { status: 'cancelled', isApproved: false, approvedBy: req.user._id },
      { new: true }
    );
    if (!camp) return res.status(404).json({ message: 'Camp not found' });
    res.json({ message: 'Camp rejected', camp });
  } catch (error) {
    console.error('rejectCamp error:', error.message);
    res.status(500).json({ message: error.message });
  }
};

const completeCamp = async (req, res) => {
  try {
    const camp = await DonationCamp.findByIdAndUpdate(
      req.params.id,
      { status: 'completed' },
      { new: true }
    );
    if (!camp) return res.status(404).json({ message: 'Camp not found' });
    res.json({ message: 'Camp marked as completed', camp });
  } catch (error) {
    console.error('completeCamp error:', error.message);
    res.status(500).json({ message: error.message });
  }
};

const getMyCampRegistrations = async (req, res) => {
  try {
    const donor = await Donor.findOne({ user: req.user._id });
    if (!donor) return res.status(404).json({ message: 'Donor not found' });
    const camps = await DonationCamp.find({ registeredDonors: donor._id }).sort({ date: -1 });
    res.json(camps);
  } catch (error) {
    console.error('getMyCampRegistrations error:', error.message);
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getNearbyCamps, getCampById, getAllCamps, createCamp, updateCamp, registerForCamp, approveCamp, rejectCamp, completeCamp, getMyCampRegistrations, seedSampleCamps };
