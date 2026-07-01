const Apartment = require('../models/Apartment');

const createApartment = async (req, res) => {
  const { title, city, price } = req.body;
  if (!title || !city || !price) {
    return res.status(400).json({ message: 'title, city and price are required' });
  }

  const apartment = await Apartment.create({ ...req.body, owner: req.user._id });
  res.status(201).json(apartment);
};

const getApartments = async (req, res) => {
  const apartments = await Apartment.find()
    .populate('owner', 'name avatar')
    .sort({ createdAt: -1 });
  res.json(apartments);
};

const getMyApartments = async (req, res) => {
  const apartments = await Apartment.find({ owner: req.user._id })
    .populate('owner', 'name avatar')
    .sort({ createdAt: -1 });
  res.json(apartments);
};

const getApartmentById = async (req, res) => {
  const apartment = await Apartment.findById(req.params.id).populate('owner', 'name avatar');
  if (!apartment) {
    return res.status(404).json({ message: 'Listing not found' });
  }
  res.json(apartment);
};

const findOwnedApartment = async (req, res) => {
  const apartment = await Apartment.findById(req.params.id);
  if (!apartment) {
    res.status(404).json({ message: 'Listing not found' });
    return null;
  }
  if (apartment.owner.toString() !== req.user._id.toString()) {
    res.status(403).json({ message: 'Not authorized to modify this listing' });
    return null;
  }
  return apartment;
};

const updateApartment = async (req, res) => {
  const apartment = await findOwnedApartment(req, res);
  if (!apartment) return;

  const { title, city, price } = req.body;
  if (!title || !city || !price) {
    return res.status(400).json({ message: 'title, city and price are required' });
  }

  Object.assign(apartment, req.body, { owner: apartment.owner });
  await apartment.save();
  res.json(apartment);
};

const deleteApartment = async (req, res) => {
  const apartment = await findOwnedApartment(req, res);
  if (!apartment) return;

  await apartment.deleteOne();
  res.json({ message: 'Listing deleted' });
};

module.exports = {
  createApartment,
  getApartments,
  getMyApartments,
  getApartmentById,
  updateApartment,
  deleteApartment,
};
