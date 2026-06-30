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

module.exports = { createApartment, getApartments };
