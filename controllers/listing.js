const Listing = require("../models/listing");
const axios = require("axios");
const mapToken = process.env.MAP_TOKEN;

module.exports.index = async (req, res) => {
  const allListings = await Listing.find({});
  res.render("./listings/index.ejs", { allListings });
};

module.exports.renderNewForm = (req, res) => {
  res.render("./listings/new.ejs");
};

module.exports.showListing = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id)
    .populate({ path: "reviews", populate: { path: "author" } })
    .populate("owner");
  if (!listing) {
    req.flash("error", "Listing you requested does not exist!");
    return res.redirect("/listings");
  }
  res.render("./listings/show.ejs", { listing });
};

module.exports.createListing = async (req, res, err) => {
  let url = req.file.path;
  let filename = req.file.filename;
  const newlisting = new Listing(req.body.listing);
  newlisting.owner = req.user._id;
  newlisting.image = { url, filename };

  //  GEOCODING PART
  const location = req.body.listing.location;
  console.log("LOCATION:", location);

  const geoRes = await axios.get("https://us1.locationiq.com/v1/search", {
    params: {
      key: mapToken,
      q: location,
      format: "json",
      limit: 1,
    },
  });
  console.log("FULL RESPONSE:", geoRes.data);
  //  if no result found
  if (!geoRes.data.length) {
    req.flash("error", "Invalid location");
    return res.redirect("/listings/new");
  }

  // const lat = geoRes.data[0].lat;
  // const lng = geoRes.data[0].lon;
  const lat = parseFloat(geoRes.data[0].lat);
  const lng = parseFloat(geoRes.data[0].lon);

  //  Store in GeoJSON format (IMPORTANT)
  newlisting.geometry = {
    type: "Point",
    coordinates: [lng, lat], // [longitude, latitude]
  };

  await newlisting.save();
  req.flash("success", "New Listing Created!");
  res.redirect("/listings");
};

module.exports.renderEditForm = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing you requested does not exist!");
    return res.redirect("/listings");
  }

  let originalImageUrl = listing.image.url;
  originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250");

  res.render("listings/edit.ejs", { listing, originalImageUrl });
};

module.exports.updateListing = async (req, res) => {
  let { id } = req.params;

  // let listing = await Listing.findById(id);
  // if (!listing.owner.equals(res.locals.currUser._id)) {
  //   req.flash("error", "You don't have permission to edit!");
  //   return res.redirect(`/listings/${id}`);
  // }

  let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });

  if (typeof req.file !== "undefined") {
    let url = req.file.path;
    let filename = req.file.filename;
    listing.image = { url, filename };
    await listing.save();
  }
  req.flash("success", "Listing Updated!");
  res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async (req, res) => {
  let { id } = req.params;
  let deletedItem = await Listing.findByIdAndDelete(id);
  console.log(deletedItem);
  req.flash("success", "Listing Deleted!");
  res.redirect("/listings");
};
