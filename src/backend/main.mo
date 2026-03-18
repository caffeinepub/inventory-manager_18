import Nat "mo:core/Nat";
import Text "mo:core/Text";
import Map "mo:core/Map";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import Iter "mo:core/Iter";
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
    sellingPrice : Float;
    expiryDate : ?Text;
  };

  type ContactMessage = {
    id : Nat;
    name : Text;
    email : Text;
    message : Text;
    createdAt : Time.Time;
    isRead : Bool;
    adminReply : ?Text;
    repliedAt : ?Time.Time;
  };

  type UserProfile = {
    name : Text;
    email : Text;
    phone : Text;
    imageId : ?Blob;
  };

  type HelpMessage = {
    id : Nat;
    senderPrincipal : Text;
    name : Text;
    email : Text;
    message : Text;
    createdAt : Time.Time;
    isRead : Bool;
    adminReply : ?Text;
    repliedAt : ?Time.Time;
  };

  type Order = {
    id : Nat;
    customerName : Text;
    customerPhone : Text;
    customerAddress : Text;
    itemId : Nat;
    itemName : Text;
    quantity : Nat;
    totalPrice : Float;
    status : Text; // "Pending", "Confirmed", "Delivered"
    createdAt : Time.Time;
  };

  type Review = {
    id : Nat;
    itemId : Nat;
    reviewerName : Text;
    rating : Nat;
    comment : Text;
    createdAt : Time.Time;
  };

  let items = Map.empty<Nat, InventoryItem>();
  var nextItemId = 1;

  let messages = Map.empty<Nat, ContactMessage>();
  var nextMessageId = 1;

  let userProfiles = Map.empty<Principal, UserProfile>();

  let helpMessages = Map.empty<Nat, HelpMessage>();
  var nextHelpMessageId = 1;

  var visitCount : Nat = 0;

  let orders = Map.empty<Nat, Order>();
  var nextOrderId = 1;

  let reviews = Map.empty<Nat, Review>();
  var nextReviewId = 1;

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

  // ── Inventory ────────────────────────────────────────────────────────────────

  public shared ({ caller }) func createItem(
    name : Text,
    category : Text,
    sku : Text,
    description : Text,
    price : Float,
    supplier : Text,
    stockQuantity : Nat,
    imageId : ?Storage.ExternalBlob,
    sellingPrice : Float,
    expiryDate : ?Text,
  ) : async Nat {
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
      sellingPrice;
      expiryDate;
    };
    items.add(nextItemId, item);
    nextItemId += 1;
    item.id;
  };

  public shared ({ caller }) func updateItem(
    id : Nat,
    name : Text,
    category : Text,
    sku : Text,
    description : Text,
    price : Float,
    supplier : Text,
    stockQuantity : Nat,
    imageId : ?Storage.ExternalBlob,
    sellingPrice : Float,
    expiryDate : ?Text,
  ) : async () {
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
          sellingPrice;
          expiryDate;
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
      adminReply = null;
      repliedAt = null;
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
          adminReply = msg.adminReply;
          repliedAt = msg.repliedAt;
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

  public shared ({ caller }) func replyToMessage(id : Nat, replyText : Text) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can reply to messages");
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
          isRead = msg.isRead;
          adminReply = ?replyText;
          repliedAt = ?Time.now();
        };
        messages.add(id, updated);
      };
    };
  };

  // ── User Profiles ────────────────────────────────────────────────────────────

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  public shared ({ caller }) func updateUserProfile(name : Text, email : Text, phone : Text, imageId : ?Blob) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update profiles");
    };
    let profile : UserProfile = {
      name;
      email;
      phone;
      imageId;
    };
    userProfiles.add(caller, profile);
  };

  public shared ({ caller }) func deleteAccount() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete their account");
    };
    // Remove user profile
    userProfiles.remove(caller);

    // Remove user's help messages
    let callerText = caller.toText();
    let helpMsgIds = Map.empty<Nat, ()>();
    for ((id, msg) in helpMessages.entries()) {
      if (msg.senderPrincipal == callerText) {
        helpMsgIds.add(id, ());
      };
    };
    for (id in helpMsgIds.keys()) {
      helpMessages.remove(id);
    };
  };

  // ── Help Center Messages ─────────────────────────────────────────────────────

  public shared ({ caller }) func submitHelpMessage(name : Text, email : Text, message : Text) : async Nat {
    let msg : HelpMessage = {
      id = nextHelpMessageId;
      senderPrincipal = caller.toText();
      name;
      email;
      message;
      createdAt = Time.now();
      isRead = false;
      adminReply = null;
      repliedAt = null;
    };
    helpMessages.add(nextHelpMessageId, msg);
    nextHelpMessageId += 1;
    msg.id;
  };

  public query ({ caller }) func getMyHelpMessages() : async [HelpMessage] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view their help messages");
    };
    let callerText = caller.toText();
    let result = Map.empty<Nat, HelpMessage>();
    for ((id, msg) in helpMessages.entries()) {
      if (msg.senderPrincipal == callerText) {
        result.add(id, msg);
      };
    };
    result.values().toArray();
  };

  public query ({ caller }) func getAllHelpMessages() : async [HelpMessage] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view all help messages");
    };
    helpMessages.values().toArray();
  };

  public shared ({ caller }) func replyToHelpMessage(id : Nat, replyText : Text) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can reply to help messages");
    };
    switch (helpMessages.get(id)) {
      case (null) { Runtime.trap("Help message not found") };
      case (?msg) {
        let updated : HelpMessage = {
          id = msg.id;
          senderPrincipal = msg.senderPrincipal;
          name = msg.name;
          email = msg.email;
          message = msg.message;
          createdAt = msg.createdAt;
          isRead = msg.isRead;
          adminReply = ?replyText;
          repliedAt = ?Time.now();
        };
        helpMessages.add(id, updated);
      };
    };
  };

  public shared ({ caller }) func deleteHelpMessage(id : Nat) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can delete help messages");
    };
    if (not helpMessages.containsKey(id)) {
      Runtime.trap("Help message not found");
    };
    helpMessages.remove(id);
  };

  // ── Visitor Counter ───────────────────────────────────────────────────────

  public shared func recordVisit() : async () {
    visitCount += 1;
  };

  public query func getVisitCount() : async Nat {
    visitCount;
  };

  // ── Orders ──────────────────────────────────────────────────────────────

  public shared func placeOrder(
    customerName : Text,
    customerPhone : Text,
    customerAddress : Text,
    itemId : Nat,
    quantity : Nat,
  ) : async Nat {
    let timestamp = Time.now();

    switch (items.get(itemId)) {
      case (null) { Runtime.trap("Item not found") };
      case (?item) {
        let totalPrice = item.sellingPrice * quantity.toFloat();
        let order : Order = {
          id = nextOrderId;
          customerName;
          customerPhone;
          customerAddress;
          itemId;
          itemName = item.name;
          quantity;
          totalPrice;
          status = "Pending";
          createdAt = timestamp;
        };
        orders.add(nextOrderId, order);
        nextOrderId += 1;
        order.id;
      };
    };
  };

  public query ({ caller }) func getAllOrders() : async [Order] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view orders");
    };
    orders.values().toArray();
  };

  public shared ({ caller }) func updateOrderStatus(orderId : Nat, status : Text) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can update order status");
    };

    switch (orders.get(orderId)) {
      case (null) { Runtime.trap("Order not found") };
      case (?order) {
        let updatedOrder : Order = {
          id = order.id;
          customerName = order.customerName;
          customerPhone = order.customerPhone;
          customerAddress = order.customerAddress;
          itemId = order.itemId;
          itemName = order.itemName;
          quantity = order.quantity;
          totalPrice = order.totalPrice;
          status;
          createdAt = order.createdAt;
        };
        orders.add(orderId, updatedOrder);
      };
    };
  };

  public query ({ caller }) func getOrder(orderId : Nat) : async Order {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view orders");
    };
    switch (orders.get(orderId)) {
      case (null) { Runtime.trap("Order not found") };
      case (?order) { order };
    };
  };

  // ── Reviews ─────────────────────────────────────────────────────────────

  public shared func submitReview(
    itemId : Nat,
    reviewerName : Text,
    rating : Nat,
    comment : Text,
  ) : async Nat {
    let timestamp = Time.now();

    switch (items.get(itemId)) {
      case (null) { Runtime.trap("Item not found") };
      case (?_item) {
        if (rating < 1 or rating > 5) {
          Runtime.trap("Rating must be between 1 and 5");
        };
        let review : Review = {
          id = nextReviewId;
          itemId;
          reviewerName;
          rating;
          comment;
          createdAt = timestamp;
        };
        reviews.add(nextReviewId, review);
        nextReviewId += 1;
        review.id;
      };
    };
  };

  public query ({ caller }) func getReviewsByItem(itemId : Nat) : async [Review] {
    let result = Map.empty<Nat, Review>();
    for ((id, review) in reviews.entries()) {
      if (review.itemId == itemId) {
        result.add(id, review);
      };
    };
    result.values().toArray();
  };

  public shared ({ caller }) func deleteReview(reviewId : Nat) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can delete reviews");
    };
    if (not reviews.containsKey(reviewId)) {
      Runtime.trap("Review not found");
    };
    reviews.remove(reviewId);
  };
};
