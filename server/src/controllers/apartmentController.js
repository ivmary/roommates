const fs = require("fs");
const path = require("path");
const Apartment = require("../models/Apartment");
const { uploadsDir } = require("../middleware/upload");

// TODO: hardcoded
const BOOL_FIELDS = ["pets", "smoking", "students", "furnished"];

function normalizeApartmentBody(body) {
  const out = { ...body };
  if (out.price !== undefined) out.price = Number(out.price);
  for (const f of BOOL_FIELDS) {
    if (out[f] !== undefined) out[f] = out[f] === true || out[f] === "true";
  }
  return out;
}

function deleteImageFile(imageUrl) {
  const filePath = path.join(uploadsDir, imageUrl.replace("/uploads/", ""));
  fs.unlink(filePath, (err) => {
    if (err && err.code !== "ENOENT")
      console.error("Failed to delete image file:", filePath, err);
  });
}

function deleteApartmentFolder(apartmentId) {
  fs.rm(
    path.join(uploadsDir, apartmentId.toString()),
    { recursive: true, force: true },
    (err) => {
      if (err)
        console.error(
          "Failed to delete apartment upload folder:",
          apartmentId,
          err,
        );
    },
  );
}

const createApartment = async (req, res) => {
  const body = normalizeApartmentBody(req.body);
  const { title, city, price } = body;
  if (!title || !city || !price) {
    return res
      .status(400)
      .json({ message: "title, city and price are required" });
  }

  const images = (req.files || []).map(
    (f) => `/uploads/${req.apartmentId}/${f.filename}`,
  );
  const apartment = await Apartment.create({
    ...body,
    _id: req.apartmentId,
    images,
    owner: req.user._id,
  });
  res.status(201).json(apartment);
};

const getApartments = async (req, res) => {
  const apartments = await Apartment.find()
    .populate("owner", "name avatar")
    .sort({ createdAt: -1 });
  res.json(apartments);
};

const getMyApartments = async (req, res) => {
  const apartments = await Apartment.find({ owner: req.user._id })
    .populate("owner", "name avatar")
    .sort({ createdAt: -1 });
  res.json(apartments);
};

const getApartmentById = async (req, res) => {
  const apartment = await Apartment.findById(req.params.id).populate(
    "owner",
    "name avatar",
  );
  if (!apartment) {
    return res.status(404).json({ message: "Listing not found" });
  }
  res.json(apartment);
};

const findOwnedApartment = async (req, res) => {
  const apartment = await Apartment.findById(req.params.id);
  if (!apartment) {
    res.status(404).json({ message: "Listing not found" });
    return null;
  }
  if (apartment.owner.toString() !== req.user._id.toString()) {
    res.status(403).json({ message: "Not authorized to modify this listing" });
    return null;
  }
  return apartment;
};

const updateApartment = async (req, res) => {
  const apartment = await findOwnedApartment(req, res);
  if (!apartment) return;

  const body = normalizeApartmentBody(req.body);
  const { title, city, price } = body;
  if (!title || !city || !price) {
    return res
      .status(400)
      .json({ message: "title, city and price are required" });
  }

  let keptImages;
  if (body.existingImages !== undefined) {
    try {
      keptImages = JSON.parse(body.existingImages);
      if (!Array.isArray(keptImages)) keptImages = [];
    } catch {
      keptImages = [];
    }
  } else {
    keptImages = apartment.images || [];
  }
  delete body.existingImages;

  const newImages = (req.files || []).map(
    (f) => `/uploads/${apartment._id}/${f.filename}`,
  );
  const images = [...keptImages, ...newImages].slice(0, 5);
  const removed = (apartment.images || []).filter(
    (img) => !images.includes(img),
  );

  Object.assign(apartment, body, { images, owner: apartment.owner });
  await apartment.save();

  removed.forEach(deleteImageFile);

  res.json(apartment);
};

const deleteApartment = async (req, res) => {
  const apartment = await findOwnedApartment(req, res);
  if (!apartment) return;

  await apartment.deleteOne();
  deleteApartmentFolder(apartment._id);
  res.json({ message: "Listing deleted" });
};

module.exports = {
  createApartment,
  getApartments,
  getMyApartments,
  getApartmentById,
  updateApartment,
  deleteApartment,
};
