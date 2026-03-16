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

  type ContactMessage = {
    id : Nat;
    name : Text;
    email : Text;
    message : Text;
    createdAt : Time.Time;
    isRead : Bool;
  };

  let items = Map.empty<Nat, InventoryItem>();
  var nextItemId = 1;

  let messages = Map.empty<Nat, ContactMessage>();
  var nextMessageId = 1;

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

  // ── Inventory ────────────────────────────────────────────────────────────────

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

  // ── Contact Messages ─────────────────────────────────────────────────────────

  public shared func submitContactMessage(name : Text, email : Text, message : Text) : async Nat {
    let msg : ContactMessage = {
      id = nextMessageId;
      name;
      email;
      message;
      createdAt = Time.now();
      isRead = false;
    };
    messages.add(nextMessageId, msg);
    nextMessageId += 1;
    msg.id;
  };

  public query ({ caller }) func getAllMessages() : async [ContactMessage] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view messages");
    };
    messages.values().toArray();
  };

  public shared ({ caller }) func deleteMessage(id : Nat) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can delete messages");
    };
    if (not messages.containsKey(id)) {
      Runtime.trap("Message not found");
    };
    messages.remove(id);
  };

  public shared ({ caller }) func markMessageRead(id : Nat) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized");
    };
    switch (messages.get(id)) {
      case (null) { Runtime.trap("Message not found") };
      case (?msg) {
        let updated : ContactMessage = {
          id = msg.id;
          name = msg.name;
          email = msg.email;
          message = msg.message;
          createdAt = msg.createdAt;
          isRead = true;
        };
        messages.add(id, updated);
      };
    };
  };

  public query ({ caller }) func getUnreadMessageCount() : async Nat {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized");
    };
    var count = 0;
    for (msg in messages.values()) {
      if (not msg.isRead) {
        count += 1;
      };
    };
    count;
  };
};
