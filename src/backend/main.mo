import Nat "mo:core/Nat";
import Text "mo:core/Text";
import Map "mo:core/Map";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";

actor {
  type InventoryItem = {
    id : Nat;
    name : Text;
    category : Text;
    sku : Text;
    description : Text;
    price : Float;
    supplier : Text;
    stockQuantity : Nat;
    imageId : ?Storage.ExternalBlob;
    createdAt : Time.Time;
    updatedAt : Time.Time;
  };

  let items = Map.empty<Nat, InventoryItem>();
  var nextItemId = 1;

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

  public shared ({ caller }) func createItem(name : Text, category : Text, sku : Text, description : Text, price : Float, supplier : Text, stockQuantity : Nat, imageId : ?Storage.ExternalBlob) : async Nat {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can create items");
    };

    let timestamp = Time.now();
    let item : InventoryItem = {
      id = nextItemId;
      name;
      category;
      sku;
      description;
      price;
      supplier;
      stockQuantity;
      imageId;
      createdAt = timestamp;
      updatedAt = timestamp;
    };

    items.add(nextItemId, item);
    nextItemId += 1;
    item.id;
  };

  public shared ({ caller }) func updateItem(id : Nat, name : Text, category : Text, sku : Text, description : Text, price : Float, supplier : Text, stockQuantity : Nat, imageId : ?Storage.ExternalBlob) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can update items");
    };

    switch (items.get(id)) {
      case (null) { Runtime.trap("Item not found") };
      case (?existingItem) {
        let updatedItem : InventoryItem = {
          id;
          name;
          category;
          sku;
          description;
          price;
          supplier;
          stockQuantity;
          imageId;
          createdAt = existingItem.createdAt;
          updatedAt = Time.now();
        };
        items.add(id, updatedItem);
      };
    };
  };

  public shared ({ caller }) func deleteItem(id : Nat) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can delete items");
    };

    if (not items.containsKey(id)) {
      Runtime.trap("Item not found");
    };
    items.remove(id);
  };

  public query ({ caller }) func getItem(id : Nat) : async InventoryItem {
    switch (items.get(id)) {
      case (null) { Runtime.trap("Item not found") };
      case (?item) { item };
    };
  };

  public query ({ caller }) func getAllItems() : async [InventoryItem] {
    items.values().toArray();
  };
};
