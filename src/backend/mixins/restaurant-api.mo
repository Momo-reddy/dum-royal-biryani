import Types "../types/restaurant";
import RestaurantLib "../lib/restaurant";

mixin () {
  public query func getProfile() : async Types.RestaurantProfile {
    RestaurantLib.getProfile();
  };

  public query func listCategories() : async [Types.MenuCategory] {
    RestaurantLib.listCategories();
  };

  public query func listMenuItems() : async [Types.MenuItem] {
    RestaurantLib.listMenuItems();
  };

  public query func listMenuItemsByCategory(categoryId : Nat) : async [Types.MenuItem] {
    RestaurantLib.listMenuItemsByCategory(categoryId);
  };

  public query func listReviews() : async [Types.Review] {
    RestaurantLib.listReviews();
  };

  public query func getRatingBreakdown() : async [Types.RatingBreakdown] {
    RestaurantLib.getRatingBreakdown();
  };

  public query func listPhotos() : async [Types.Photo] {
    RestaurantLib.listPhotos();
  };
};
