module {
  public type RestaurantProfile = {
    name : Text;
    tagline : Text;
    cuisine : Text;
    rating : Float;
    reviewCount : Nat;
    priceRangeLow : Nat;
    priceRangeHigh : Nat;
    priceRangeNote : Text;
    tags : [Text];
    addressLine1 : Text;
    addressLine2 : Text;
    city : Text;
    state : Text;
    postalCode : Text;
    phone : Text;
    hoursSummary : Text;
    closingTime : Text;
  };

  public type MenuCategory = {
    id : Nat;
    name : Text;
    description : Text;
    order : Nat;
  };

  public type MenuItem = {
    id : Nat;
    categoryId : Nat;
    name : Text;
    description : Text;
    isVeg : Bool;
    isSignature : Bool;
    order : Nat;
  };

  public type Review = {
    id : Nat;
    reviewerName : Text;
    rating : Nat;
    date : Text;
    text : Text;
  };

  public type RatingBreakdown = {
    stars : Nat;
    count : Nat;
  };

  public type Photo = {
    id : Nat;
    title : Text;
    caption : Text;
    imageRef : Text;
  };
};
