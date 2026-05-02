const express = require("express");
const router = express.Router();
const asyncWrap = require("../utils/wrapAsync.js");
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");
const { findById } = require("../models/review.js");

const listingController = require("../controllers/listing.js");

const multer = require("multer");
const { storage } = require("../cloudConfig.js");
// const upload = multer({ dest: "uploads/" });
const upload = multer({ storage });

router
  .route("/")
  .get(wrapAsync(listingController.index))

  .post(
    isLoggedIn,
    validateListing,
    upload.single("listing[image]"),
    wrapAsync(listingController.createListing),
  );

//create route
router.get("/new", isLoggedIn, listingController.renderNewForm);

router
  .route("/:id")

  .get(wrapAsync(listingController.showListing))

  .put(
    isOwner,
    isLoggedIn,
    upload.single("listing[image]"),
    validateListing,
    wrapAsync(listingController.updateListing),
  )

  .delete(isOwner, isLoggedIn, wrapAsync(listingController.destroyListing));

router.get(
  "/:id/edit",
  isLoggedIn,
  isOwner,
  wrapAsync(listingController.renderEditForm),
);

module.exports = router;
