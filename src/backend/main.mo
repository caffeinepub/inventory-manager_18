import Nat "mo:core/Nat";
import Text "mo:core/Text";
import Map "mo:core/Map";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";

actor {
  // Original InventoryItem type -- UNCHANGED for stable variable compatibility
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

  // Extended return type that includes new fields
  type InventoryItemFull = {
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
    gstRate : Float;
    previousPrice : ?Float;
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
    status : Text;
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

  type Supplier = {
    id : Nat;
    name : Text;
    contactPerson : Text;
    phone : Text;
    email : Text;
    address : Text;
    category : Text;
    isActive : Bool;
  };

  type Expense = {
    id : Nat;
    title : Text;
    amount : Float;
    category : Text;
    date : Text;
    notes : Text;
    createdAt : Time.Time;
  };

  type InventoryLog = {
    id : Nat;
    itemId : Nat;
    itemName : Text;
    action : Text;
    performedBy : Text;
    timestamp : Time.Time;
  };

  // Original stable maps -- unchanged types
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

  // New stable maps for extended item fields (avoids migration issues)
  let itemGstRates = Map.empty<Nat, Float>();
  let itemPreviousPrices = Map.empty<Nat, Float>();

  let suppliers = Map.empty<Nat, Supplier>();
  var nextSupplierId = 1;

  let expenses = Map.empty<Nat, Expense>();
  var nextExpenseId = 1;

  let inventoryLogs = Map.empty<Nat, InventoryLog>();
  var nextLogId = 1;

  let staffMembers = Map.empty<Principal, Bool>();

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

  // ── Internal helpers ───────────────────────────────────────────────────────────

  func toFull(item : InventoryItem) : InventoryItemFull {
    let gstRate = switch (itemGstRates.get(item.id)) { case (?r) r; case null 0.0 };
    let previousPrice = itemPreviousPrices.get(item.id);
    {
      id = item.id; name = item.name; category = item.category; sku = item.sku;
      description = item.description; price = item.price; supplier = item.supplier;
      stockQuantity = item.stockQuantity; imageId = item.imageId;
      createdAt = item.createdAt; updatedAt = item.updatedAt;
      sellingPrice = item.sellingPrice; expiryDate = item.expiryDate;
      gstRate; previousPrice;
    };
  };

  func logAction(itemId : Nat, itemName : Text, action : Text, performedBy : Text) {
    let entry : InventoryLog = {
      id = nextLogId; itemId; itemName; action; performedBy;
      timestamp = Time.now();
    };
    inventoryLogs.add(nextLogId, entry);
    nextLogId += 1;
  };

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
    gstRate : Float,
  ) : async Nat {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can create items");
    };
    let timestamp = Time.now();
    let item : InventoryItem = {
      id = nextItemId; name; category; sku; description; price; supplier;
      stockQuantity; imageId; createdAt = timestamp; updatedAt = timestamp;
      sellingPrice; expiryDate;
    };
    items.add(nextItemId, item);
    itemGstRates.add(nextItemId, gstRate);
    logAction(nextItemId, name, "Created", caller.toText());
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
    gstRate : Float,
  ) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can update items");
    };
    switch (items.get(id)) {
      case (null) { Runtime.trap("Item not found") };
      case (?existingItem) {
        // Track price drop
        if (price < existingItem.price) {
          itemPreviousPrices.add(id, existingItem.price);
        };
        let updatedItem : InventoryItem = {
          id; name; category; sku; description; price; supplier;
          stockQuantity; imageId;
          createdAt = existingItem.createdAt;
          updatedAt = Time.now();
          sellingPrice; expiryDate;
        };
        items.add(id, updatedItem);
        itemGstRates.add(id, gstRate);
        logAction(id, name, "Updated", caller.toText());
      };
    };
  };

  public shared ({ caller }) func deleteItem(id : Nat) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can delete items");
    };
    switch (items.get(id)) {
      case (null) { Runtime.trap("Item not found") };
      case (?item) {
        logAction(id, item.name, "Deleted", caller.toText());
        items.remove(id);
        itemGstRates.remove(id);
        itemPreviousPrices.remove(id);
      };
    };
  };

  public query func getItem(id : Nat) : async InventoryItemFull {
    switch (items.get(id)) {
      case (null) { Runtime.trap("Item not found") };
      case (?item) { toFull(item) };
    };
  };

  public query func getAllItems() : async [InventoryItemFull] {
    items.values().map(toFull).toArray();
  };

  // ── Inventory Logs ───────────────────────────────────────────────────────────

  public query ({ caller }) func getInventoryLogs() : async [InventoryLog] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view logs");
    };
    inventoryLogs.values().toArray();
  };

  // ── Suppliers ─────────────────────────────────────────────────────────────

  public shared ({ caller }) func addSupplier(
    name : Text, contactPerson : Text, phone : Text,
    email : Text, address : Text, category : Text,
  ) : async Nat {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can add suppliers");
    };
    let supplier : Supplier = {
      id = nextSupplierId; name; contactPerson; phone; email; address; category; isActive = true;
    };
    suppliers.add(nextSupplierId, supplier);
    nextSupplierId += 1;
    supplier.id;
  };

  public shared ({ caller }) func updateSupplier(
    id : Nat, name : Text, contactPerson : Text, phone : Text,
    email : Text, address : Text, category : Text, isActive : Bool,
  ) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized");
    };
    switch (suppliers.get(id)) {
      case (null) { Runtime.trap("Supplier not found") };
      case (?_) {
        suppliers.add(id, { id; name; contactPerson; phone; email; address; category; isActive });
      };
    };
  };

  public shared ({ caller }) func deleteSupplier(id : Nat) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized");
    };
    if (not suppliers.containsKey(id)) { Runtime.trap("Supplier not found") };
    suppliers.remove(id);
  };

  public query func getAllSuppliers() : async [Supplier] {
    suppliers.values().toArray();
  };

  // ── Expenses ──────────────────────────────────────────────────────────────

  public shared ({ caller }) func addExpense(
    title : Text, amount : Float, category : Text, date : Text, notes : Text,
  ) : async Nat {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized");
    };
    let expense : Expense = {
      id = nextExpenseId; title; amount; category; date; notes;
      createdAt = Time.now();
    };
    expenses.add(nextExpenseId, expense);
    nextExpenseId += 1;
    expense.id;
  };

  public shared ({ caller }) func deleteExpense(id : Nat) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized");
    };
    if (not expenses.containsKey(id)) { Runtime.trap("Expense not found") };
    expenses.remove(id);
  };

  public query ({ caller }) func getAllExpenses() : async [Expense] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized");
    };
    expenses.values().toArray();
  };

  // ── Staff Management ─────────────────────────────────────────────────────

  public shared ({ caller }) func addStaffMember(staffPrincipal : Principal) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized");
    };
    staffMembers.add(staffPrincipal, true);
  };

  public shared ({ caller }) func removeStaffMember(staffPrincipal : Principal) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized");
    };
    staffMembers.remove(staffPrincipal);
  };

  public query func isStaff(p : Principal) : async Bool {
    switch (staffMembers.get(p)) { case (?v) v; case null false };
  };

  public query ({ caller }) func getAllStaffMembers() : async [Text] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized");
    };
    staffMembers.keys().map(func(p : Principal) : Text { p.toText() }).toArray();
  };

  // ── Contact Messages ─────────────────────────────────────────────────────────

  public shared func submitContactMessage(name : Text, email : Text, message : Text) : async Nat {
    let msg : ContactMessage = {
      id = nextMessageId; name; email; message;
      createdAt = Time.now(); isRead = false;
      adminReply = null; repliedAt = null;
    };
    messages.add(nextMessageId, msg);
    nextMessageId += 1;
    msg.id;
  };

  public query ({ caller }) func getAllMessages() : async [ContactMessage] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized");
    };
    messages.values().toArray();
  };

  public shared ({ caller }) func deleteMessage(id : Nat) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized");
    };
    if (not messages.containsKey(id)) { Runtime.trap("Message not found") };
    messages.remove(id);
  };

  public shared ({ caller }) func markMessageRead(id : Nat) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized");
    };
    switch (messages.get(id)) {
      case (null) { Runtime.trap("Message not found") };
      case (?msg) {
        messages.add(id, {
          id = msg.id; name = msg.name; email = msg.email; message = msg.message;
          createdAt = msg.createdAt; isRead = true;
          adminReply = msg.adminReply; repliedAt = msg.repliedAt;
        });
      };
    };
  };

  public query ({ caller }) func getUnreadMessageCount() : async Nat {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized");
    };
    var count = 0;
    for (msg in messages.values()) {
      if (not msg.isRead) { count += 1 };
    };
    count;
  };

  public shared ({ caller }) func replyToMessage(id : Nat, replyText : Text) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized");
    };
    switch (messages.get(id)) {
      case (null) { Runtime.trap("Message not found") };
      case (?msg) {
        messages.add(id, {
          id = msg.id; name = msg.name; email = msg.email; message = msg.message;
          createdAt = msg.createdAt; isRead = msg.isRead;
          adminReply = ?replyText; repliedAt = ?Time.now();
        });
      };
    };
  };

  // ── User Profiles ────────────────────────────────────────────────────────────

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    userProfiles.get(caller);
  };

  public shared ({ caller }) func updateUserProfile(name : Text, email : Text, phone : Text, imageId : ?Blob) : async () {
    userProfiles.add(caller, { name; email; phone; imageId });
  };

  public shared ({ caller }) func deleteAccount() : async () {
    userProfiles.remove(caller);
  };

  // ── Help Center Messages ─────────────────────────────────────────────────────

  public shared ({ caller }) func submitHelpMessage(name : Text, email : Text, message : Text) : async Nat {
    let msg : HelpMessage = {
      id = nextHelpMessageId; senderPrincipal = caller.toText();
      name; email; message; createdAt = Time.now();
      isRead = false; adminReply = null; repliedAt = null;
    };
    helpMessages.add(nextHelpMessageId, msg);
    nextHelpMessageId += 1;
    msg.id;
  };

  public query ({ caller }) func getAllHelpMessages() : async [HelpMessage] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized");
    };
    helpMessages.values().toArray();
  };

  public shared ({ caller }) func replyToHelpMessage(id : Nat, replyText : Text) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized");
    };
    switch (helpMessages.get(id)) {
      case (null) { Runtime.trap("Help message not found") };
      case (?msg) {
        helpMessages.add(id, {
          id = msg.id; senderPrincipal = msg.senderPrincipal;
          name = msg.name; email = msg.email; message = msg.message;
          createdAt = msg.createdAt; isRead = msg.isRead;
          adminReply = ?replyText; repliedAt = ?Time.now();
        });
      };
    };
  };

  public shared ({ caller }) func deleteHelpMessage(id : Nat) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized");
    };
    if (not helpMessages.containsKey(id)) { Runtime.trap("Help message not found") };
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
    customerName : Text, customerPhone : Text, customerAddress : Text,
    itemId : Nat, quantity : Nat,
  ) : async Nat {
    switch (items.get(itemId)) {
      case (null) { Runtime.trap("Item not found") };
      case (?item) {
        let totalPrice = item.sellingPrice * quantity.toFloat();
        let order : Order = {
          id = nextOrderId; customerName; customerPhone; customerAddress;
          itemId; itemName = item.name; quantity; totalPrice;
          status = "Pending"; createdAt = Time.now();
        };
        orders.add(nextOrderId, order);
        nextOrderId += 1;
        order.id;
      };
    };
  };

  public query ({ caller }) func getAllOrders() : async [Order] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized");
    };
    orders.values().toArray();
  };

  public shared ({ caller }) func updateOrderStatus(orderId : Nat, status : Text) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized");
    };
    switch (orders.get(orderId)) {
      case (null) { Runtime.trap("Order not found") };
      case (?order) {
        orders.add(orderId, {
          id = order.id; customerName = order.customerName;
          customerPhone = order.customerPhone; customerAddress = order.customerAddress;
          itemId = order.itemId; itemName = order.itemName;
          quantity = order.quantity; totalPrice = order.totalPrice;
          status; createdAt = order.createdAt;
        });
      };
    };
  };

  // ── Reviews ─────────────────────────────────────────────────────────────

  public shared func submitReview(
    itemId : Nat, reviewerName : Text, rating : Nat, comment : Text,
  ) : async Nat {
    switch (items.get(itemId)) {
      case (null) { Runtime.trap("Item not found") };
      case (?_) {
        if (rating < 1 or rating > 5) { Runtime.trap("Rating must be between 1 and 5") };
        let review : Review = {
          id = nextReviewId; itemId; reviewerName; rating; comment;
          createdAt = Time.now();
        };
        reviews.add(nextReviewId, review);
        nextReviewId += 1;
        review.id;
      };
    };
  };

  public query func getReviewsByItem(itemId : Nat) : async [Review] {
    let result = Map.empty<Nat, Review>();
    for ((id, review) in reviews.entries()) {
      if (review.itemId == itemId) { result.add(id, review) };
    };
    result.values().toArray();
  };

  public shared ({ caller }) func deleteReview(reviewId : Nat) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized");
    };
    if (not reviews.containsKey(reviewId)) { Runtime.trap("Review not found") };
    reviews.remove(reviewId);
  };
};
