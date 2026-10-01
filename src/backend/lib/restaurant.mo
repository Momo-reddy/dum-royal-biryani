import Types "../types/restaurant";

module {
  let profile : Types.RestaurantProfile = {
    name = "DUM | The Royal Biryani Kitchen";
    tagline = "Slow-cooked dum biryani, royal recipes, and a table that always has room for one more.";
    cuisine = "Biryani / Indian";
    rating = 4.6;
    reviewCount = 1024;
    priceRangeLow = 400;
    priceRangeHigh = 1600;
    priceRangeNote = "per person";
    tags = ["Happy-hour food", "Vegetarian options", "Kids' menu"];
    addressLine1 = "35, 80 Feet Rd, HAL 3rd Stage";
    addressLine2 = "Indiranagar";
    city = "Bengaluru";
    state = "Karnataka";
    postalCode = "560075";
    phone = "099000 06552";
    hoursSummary = "Open daily · 11:30 am – 2:00 am";
    closingTime = "2 am";
  };

  let categories : [Types.MenuCategory] = [
    { id = 1; name = "Biryani"; description = "Sealed-pot dum biryanis layered with long-grain basmati, saffron and slow-cooked meat or vegetables."; order = 1 },
    { id = 2; name = "Starters"; description = "Crisp, smoky bites from the tandoor and the kadai to open the meal."; order = 2 },
    { id = 3; name = "Kebabs"; description = "Hand-skewered kebabs marinated overnight and finished over live coals."; order = 3 },
    { id = 4; name = "Breads"; description = "Freshly rolled naans, kulchas and parathas straight from the tandoor."; order = 4 },
    { id = 5; name = "Desserts"; description = "Classic Indian sweets to close the feast on a warm, fragrant note."; order = 5 },
    { id = 6; name = "Beverages"; description = "Cooling lassis, spiced chai and house-made mocktails."; order = 6 },
  ];

  let menuItems : [Types.MenuItem] = [
    // Biryani
    { id = 101; categoryId = 1; name = "Hyderabadi Dum Chicken Biryani"; description = "Signature. Long-grain basmati and tender chicken sealed and slow-cooked on dum with saffron and fried onions."; isVeg = false; isSignature = true; order = 1 },
    { id = 102; categoryId = 1; name = "Royal Mutton Dum Biryani"; description = "Signature. Overnight-marinated mutton layered with fragrant rice, whole spices and a hint of rose water."; isVeg = false; isSignature = true; order = 2 },
    { id = 103; categoryId = 1; name = "Subz Dum Biryani"; description = "Seasonal vegetables, paneer and cashews sealed with basmati and delicate dum spices."; isVeg = true; isSignature = false; order = 3 },
    { id = 104; categoryId = 1; name = "Prawn Biryani"; description = "Coastal-style prawns tossed in roasted masala and layered with saffron rice."; isVeg = false; isSignature = false; order = 4 },
    { id = 105; categoryId = 1; name = "Egg Dum Biryani"; description = "Boiled eggs simmered in a rich biryani masala and finished on dum."; isVeg = false; isSignature = false; order = 5 },
    { id = 106; categoryId = 1; name = "Paneer Tikka Biryani"; description = "Char-grilled paneer tikka folded through spiced basmati with mint."; isVeg = true; isSignature = false; order = 6 },

    // Starters
    { id = 201; categoryId = 2; name = "Paneer Tikka"; description = "Cottage cheese cubes marinated in yoghurt and spices, charred in the tandoor."; isVeg = true; isSignature = false; order = 1 },
    { id = 202; categoryId = 2; name = "Chicken 65"; description = "Signature. Crisp fried chicken tossed with curry leaves, green chilli and yoghurt."; isVeg = false; isSignature = true; order = 2 },
    { id = 203; categoryId = 2; name = "Gobi Manchurian"; description = "Crisp cauliflower florets in a tangy Indo-Chinese sauce."; isVeg = true; isSignature = false; order = 3 },
    { id = 204; categoryId = 2; name = "Apollo Fish"; description = "Boneless fish fried golden and tossed with chillies, garlic and curry leaves."; isVeg = false; isSignature = false; order = 4 },
    { id = 205; categoryId = 2; name = "Mushroom Pepper Fry"; description = "Button mushrooms sautéed with cracked pepper, onion and curry leaves."; isVeg = true; isSignature = false; order = 5 },

    // Kebabs
    { id = 301; categoryId = 3; name = "Murgh Malai Kebab"; description = "Signature. Creamy chicken kebabs with cheese, cardamom and a gentle char."; isVeg = false; isSignature = true; order = 1 },
    { id = 302; categoryId = 3; name = "Galouti Kebab"; description = "Melt-in-mouth minced mutton kebabs with aromatic Awadhi spices."; isVeg = false; isSignature = false; order = 2 },
    { id = 303; categoryId = 3; name = "Veg Seekh Kebab"; description = "Skewered minced vegetables and paneer with mint chutney."; isVeg = true; isSignature = false; order = 3 },
    { id = 304; categoryId = 3; name = "Tangdi Kebab"; description = "Chicken drumsticks marinated overnight and grilled over coals."; isVeg = false; isSignature = false; order = 4 },

    // Breads
    { id = 401; categoryId = 4; name = "Butter Naan"; description = "Soft tandoor-baked naan brushed with butter."; isVeg = true; isSignature = false; order = 1 },
    { id = 402; categoryId = 4; name = "Garlic Naan"; description = "Naan topped with roasted garlic and coriander."; isVeg = true; isSignature = false; order = 2 },
    { id = 403; categoryId = 4; name = "Laccha Paratha"; description = "Flaky layered whole-wheat paratha from the tandoor."; isVeg = true; isSignature = false; order = 3 },
    { id = 404; categoryId = 4; name = "Kashmiri Kulcha"; description = "Sweet-savoury kulcha stuffed with cherries and nuts."; isVeg = true; isSignature = false; order = 4 },

    // Desserts
    { id = 501; categoryId = 5; name = "Double Ka Meetha"; description = "Signature. Hyderabadi bread pudding soaked in saffron milk and ghee."; isVeg = true; isSignature = true; order = 1 },
    { id = 502; categoryId = 5; name = "Gulab Jamun"; description = "Warm milk dumplings in rose-cardamom syrup."; isVeg = true; isSignature = false; order = 2 },
    { id = 503; categoryId = 5; name = "Qubani Ka Meetha"; description = "Stewed apricot compote served with fresh cream."; isVeg = true; isSignature = false; order = 3 },
    { id = 504; categoryId = 5; name = "Kulfi Falooda"; description = "Slow-churned kulfi with rose falooda and basil seeds."; isVeg = true; isSignature = false; order = 4 },

    // Beverages
    { id = 601; categoryId = 6; name = "Sweet Lassi"; description = "Thick churned yoghurt sweetened with a touch of cardamom."; isVeg = true; isSignature = false; order = 1 },
    { id = 602; categoryId = 6; name = "Masala Chai"; description = "Spiced Indian tea brewed with ginger and cardamom."; isVeg = true; isSignature = false; order = 2 },
    { id = 603; categoryId = 6; name = "Fresh Lime Soda"; description = "Sparkling lime soda, sweet or salted."; isVeg = true; isSignature = false; order = 3 },
    { id = 604; categoryId = 6; name = "Rose Falooda Shake"; description = "Chilled rose milkshake with vermicelli and basil seeds."; isVeg = true; isSignature = false; order = 4 },
  ];

  let reviews : [Types.Review] = [
    { id = 1; reviewerName = "Ananya Rao"; rating = 5; date = "2026-08-14"; text = "The Royal Mutton Dum Biryani is the real deal — the rice is fragrant and every grain is separate. Easily the best biryani I have had in Indiranagar." },
    { id = 2; reviewerName = "Karthik Menon"; rating = 5; date = "2026-08-02"; text = "Came for the kebabs and stayed for the Double Ka Meetha. Murgh Malai Kebab was creamy and perfectly charred. Service was warm and quick." },
    { id = 3; reviewerName = "Priya Nair"; rating = 4; date = "2026-07-27"; text = "Great vegetarian spread — the Subz Dum Biryani and Paneer Tikka were both excellent. Slightly noisy on a Saturday night but worth it." },
    { id = 4; reviewerName = "Rahul Shetty"; rating = 5; date = "2026-07-19"; text = "The dum is done right here. Mutton was falling off the bone and the saffron came through beautifully. Portions are generous for the price." },
    { id = 5; reviewerName = "Sneha Iyer"; rating = 4; date = "2026-07-05"; text = "Lovely ambience and attentive staff. The Galouti Kebab melts in your mouth. Would love a few more dessert options but no complaints otherwise." },
    { id = 6; reviewerName = "Arjun Deshpande"; rating = 5; date = "2026-06-22"; text = "Ordered the Chicken 65 and Hyderabadi Dum Chicken Biryani — both packed with flavour. The happy-hour pricing makes it even better." },
    { id = 7; reviewerName = "Meera Krishnan"; rating = 4; date = "2026-06-11"; text = "Took the family for dinner and the kids' menu was a lifesaver. Biryani was rich and well spiced, though a touch heavy for me." },
    { id = 8; reviewerName = "Vikram Singh"; rating = 5; date = "2026-05-30"; text = "A proper royal biryani house. The Prawn Biryani was fresh and the Qubani Ka Meetha was the perfect finish. Will be back." },
    { id = 9; reviewerName = "Divya Pillai"; rating = 4; date = "2026-05-18"; text = "Consistently good. The Paneer Tikka Biryani is my go-to and the masala chai is spot on. Parking can be tricky in the evening." },
    { id = 10; reviewerName = "Imran Khan"; rating = 5; date = "2026-05-04"; text = "The Tangdi Kebab and mutton biryani were outstanding. Rich, aromatic and clearly cooked with care. Highly recommended." },
  ];

  let ratingBreakdown : [Types.RatingBreakdown] = [
    { stars = 5; count = 742 },
    { stars = 4; count = 205 },
    { stars = 3; count = 51 },
    { stars = 2; count = 16 },
    { stars = 1; count = 10 },
  ];

  let photos : [Types.Photo] = [
    { id = 1; title = "Royal Mutton Dum Biryani"; caption = "Sealed-pot biryani opened at the table, steam and saffron rising."; imageRef = "royal-mutton-dum-biryani" },
    { id = 2; title = "Hyderabadi Chicken Biryani"; caption = "Long-grain basmati layered with tender chicken and fried onions."; imageRef = "hyderabadi-chicken-biryani" },
    { id = 3; title = "Murgh Malai Kebab"; caption = "Creamy kebabs fresh off the skewer with a smoky char."; imageRef = "murgh-malai-kebab" },
    { id = 4; title = "Tandoor Breads"; caption = "Butter naan and laccha paratha straight from the clay oven."; imageRef = "tandoor-breads" },
    { id = 5; title = "Double Ka Meetha"; caption = "Hyderabadi bread pudding soaked in saffron milk."; imageRef = "double-ka-meetha" },
    { id = 6; title = "The Dining Room"; caption = "Warm, low-lit interiors with brass accents and carved wood."; imageRef = "dining-room" },
  ];

  public func getProfile() : Types.RestaurantProfile {
    profile;
  };

  public func allCategories() : [Types.MenuCategory] {
    categories;
  };

  public func allMenuItems() : [Types.MenuItem] {
    menuItems;
  };

  public func allReviews() : [Types.Review] {
    reviews;
  };

  public func allRatingBreakdown() : [Types.RatingBreakdown] {
    ratingBreakdown;
  };

  public func allPhotos() : [Types.Photo] {
    photos;
  };

  public func listCategories() : [Types.MenuCategory] {
    categories;
  };

  public func listMenuItems() : [Types.MenuItem] {
    menuItems;
  };

  public func listMenuItemsByCategory(categoryId : Nat) : [Types.MenuItem] {
    menuItems.filter(func item = item.categoryId == categoryId);
  };

  public func listReviews() : [Types.Review] {
    reviews;
  };

  public func getRatingBreakdown() : [Types.RatingBreakdown] {
    ratingBreakdown;
  };

  public func listPhotos() : [Types.Photo] {
    photos;
  };
};
