import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Time "mo:core/Time";
import Storage "blob-storage/Storage";

module {
  type OldInventoryItem = {
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

  type OldActor = {
    items : Map.Map<Nat, OldInventoryItem>;
  };

  type NewInventoryItem = {
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
    sellingPrice : Float;
    expiryDate : ?Text;
  };

  type NewActor = {
    items : Map.Map<Nat, NewInventoryItem>;
  };

  public func run(old : OldActor) : NewActor {
    let newItems = old.items.map<Nat, OldInventoryItem, NewInventoryItem>(
      func(_id, oldItem) {
        { oldItem with sellingPrice = oldItem.price; expiryDate = null };
      }
    );
    { items = newItems };
  };
};
