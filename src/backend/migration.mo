import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Time "mo:core/Time";
import Principal "mo:core/Principal";

module {
  type InventoryItem = {
    id : Nat;
    name : Text;
    category : Text;
    sku : Text;
    description : Text;
    price : Float;
    supplier : Text;
    stockQuantity : Nat;
    imageId : ?Blob;
    createdAt : Time.Time;
    updatedAt : Time.Time;
  };

  type OldContactMessage = {
    id : Nat;
    name : Text;
    email : Text;
    message : Text;
    createdAt : Time.Time;
    isRead : Bool;
  };

  type OldActor = {
    items : Map.Map<Nat, InventoryItem>;
    nextItemId : Nat;
    messages : Map.Map<Nat, OldContactMessage>;
    nextMessageId : Nat;
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

  type NewContactMessage = {
    id : Nat;
    name : Text;
    email : Text;
    message : Text;
    createdAt : Time.Time;
    isRead : Bool;
    adminReply : ?Text;
    repliedAt : ?Time.Time;
  };

  type NewActor = {
    items : Map.Map<Nat, InventoryItem>;
    nextItemId : Nat;
    messages : Map.Map<Nat, NewContactMessage>;
    nextMessageId : Nat;
    userProfiles : Map.Map<Principal, UserProfile>;
    helpMessages : Map.Map<Nat, HelpMessage>;
    nextHelpMessageId : Nat;
  };

  public func run(old : OldActor) : NewActor {
    let newMessages = old.messages.map<Nat, OldContactMessage, NewContactMessage>(
      func(_id, oldMsg) {
        { oldMsg with adminReply = null; repliedAt = null };
      }
    );
    {
      old with
      messages = newMessages;
      userProfiles = Map.empty<Principal, UserProfile>();
      helpMessages = Map.empty<Nat, HelpMessage>();
      nextHelpMessageId = 1;
    };
  };
};
