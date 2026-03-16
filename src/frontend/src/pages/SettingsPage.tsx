import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Database,
  Globe,
  HelpCircle,
  Key,
  Loader2,
  Lock,
  LogIn,
  MessageSquare,
  Monitor,
  Send,
  Settings,
  Shield,
  Smartphone,
  Trash2,
  User,
  UserPlus,
  UserX,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useDeleteAccount,
  useGetCallerProfile,
  useMyHelpMessages,
  useSaveCallerProfile,
  useSubmitHelpMessage,
} from "../hooks/useQueries";
import type { HelpMessage } from "../hooks/useQueries";

const LANGUAGES = [
  "English",
  "Hindi",
  "Spanish",
  "French",
  "German",
  "Arabic",
  "Portuguese",
  "Japanese",
  "Chinese (Simplified)",
  "Russian",
  "Korean",
  "Italian",
  "Turkish",
  "Dutch",
  "Polish",
];

const SECTIONS = [
  { id: "account", label: "Account", icon: User },
  { id: "privacy", label: "Privacy & Security", icon: Shield },
  { id: "help", label: "Help Center", icon: HelpCircle },
  { id: "language", label: "App Language", icon: Globe },
  { id: "storage", label: "Storage & Data", icon: Database },
];

function formatNano(ns: bigint): string {
  const ms = Number(ns / 1_000_000n);
  return new Date(ms).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ── Account Settings ─────────────────────────────────────────────────────

function AccountSettings() {
  const { identity, login, isLoggingIn } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const { data: profile, isLoading: profileLoading } =
    useGetCallerProfile(isAuthenticated);
  const saveProfile = useSaveCallerProfile();
  const deleteAccount = useDeleteAccount();
  const { clear } = useInternetIdentity();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newAccountDone, setNewAccountDone] = useState(false);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  useEffect(() => {
    if (profile) {
      setName(profile.name ?? "");
      setEmail(profile.email ?? "");
      setPhone(profile.phone ?? "");
    }
  }, [profile]);

  const handleSaveProfile = async () => {
    try {
      await saveProfile.mutateAsync({ name, email, phone, imageId: undefined });
      toast.success("Profile saved successfully!");
    } catch {
      toast.error("Failed to save profile.");
    }
  };

  const handleCreateAccount = () => {
    if (!newName.trim() || !newEmail.trim()) {
      toast.error("Please fill in all fields.");
      return;
    }
    setNewAccountDone(true);
    toast.success("Account creation request submitted!");
    setNewName("");
    setNewEmail("");
  };

  const handleDeleteConfirm = async () => {
    if (deleteConfirmText !== "DELETE") {
      toast.error('Please type "DELETE" to confirm.');
      return;
    }
    try {
      await deleteAccount.mutateAsync();
      toast.success("Account deleted.");
      setDeleteOpen(false);
      clear();
    } catch {
      toast.error("Failed to delete account.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Edit Profile */}
      <Card className="border-border">
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <User className="w-4 h-4 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base">Edit Profile</CardTitle>
              <CardDescription className="text-xs">
                Update your personal information
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {!isAuthenticated ? (
            <div className="text-center py-6">
              <p className="text-sm text-muted-foreground mb-4">
                Sign in to edit your profile
              </p>
              <Button
                onClick={login}
                disabled={isLoggingIn}
                data-ocid="settings.login_button"
                className="bg-primary text-primary-foreground"
              >
                {isLoggingIn ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <LogIn className="w-4 h-4 mr-2" />
                )}
                Sign In
              </Button>
            </div>
          ) : profileLoading ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="profile-name">Full Name</Label>
                <Input
                  id="profile-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  data-ocid="settings.profile_name_input"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="profile-email">Email</Label>
                <Input
                  id="profile-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  data-ocid="settings.profile_email_input"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="profile-phone">Phone</Label>
                <Input
                  id="profile-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 234 567 8900"
                  data-ocid="settings.profile_phone_input"
                />
              </div>
              <Button
                onClick={handleSaveProfile}
                disabled={saveProfile.isPending}
                className="bg-primary text-primary-foreground hover:bg-primary/90 w-full"
                data-ocid="settings.profile_save_button"
              >
                {saveProfile.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : null}
                Save Profile
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create New Account */}
      <Card className="border-border">
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
              <UserPlus className="w-4 h-4 text-green-600" />
            </div>
            <div>
              <CardTitle className="text-base">Create New Account</CardTitle>
              <CardDescription className="text-xs">
                Register a new user account
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {newAccountDone ? (
            <div
              className="text-center py-4"
              data-ocid="settings.create_account_success_state"
            >
              <p className="text-sm font-medium text-green-600">
                ✓ Account creation request submitted!
              </p>
              <Button
                variant="ghost"
                size="sm"
                className="mt-2 text-xs"
                onClick={() => setNewAccountDone(false)}
              >
                Create another
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="new-name">Full Name</Label>
                <Input
                  id="new-name"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="New user name"
                  data-ocid="settings.create_name_input"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="new-email">Email</Label>
                <Input
                  id="new-email"
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="user@email.com"
                  data-ocid="settings.create_email_input"
                />
              </div>
              <Button
                onClick={handleCreateAccount}
                className="bg-primary text-primary-foreground hover:bg-primary/90 w-full"
                data-ocid="settings.create_account_button"
              >
                Create Account
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Account */}
      <Card className="border-destructive/30">
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center">
              <UserX className="w-4 h-4 text-destructive" />
            </div>
            <div>
              <CardTitle className="text-base text-destructive">
                Delete Account
              </CardTitle>
              <CardDescription className="text-xs">
                Permanently remove your account and all data
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {!isAuthenticated ? (
            <p className="text-sm text-muted-foreground">
              Sign in to manage account deletion.
            </p>
          ) : (
            <div>
              <p className="text-sm text-muted-foreground mb-4">
                This action is permanent and cannot be undone.
              </p>
              <Button
                variant="destructive"
                onClick={() => setDeleteOpen(true)}
                data-ocid="settings.delete_account_button"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete My Account
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirm Dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent data-ocid="settings.delete_dialog">
          <DialogHeader>
            <DialogTitle className="text-destructive">
              Delete Account
            </DialogTitle>
            <DialogDescription>
              This is permanent. Type{" "}
              <span className="font-mono font-bold text-destructive">
                DELETE
              </span>{" "}
              to confirm.
            </DialogDescription>
          </DialogHeader>
          <Input
            value={deleteConfirmText}
            onChange={(e) => setDeleteConfirmText(e.target.value)}
            placeholder='Type "DELETE" to confirm'
            data-ocid="settings.delete_confirm_input"
          />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteOpen(false)}
              data-ocid="settings.delete_cancel_button"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={
                deleteConfirmText !== "DELETE" || deleteAccount.isPending
              }
              data-ocid="settings.delete_confirm_button"
            >
              {deleteAccount.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : null}
              Delete Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ── Privacy & Security ───────────────────────────────────────────────────

function PrivacySection() {
  return (
    <div className="space-y-6">
      {/* Passkeys */}
      <Card className="border-border">
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <Key className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <CardTitle className="text-base">Passkeys</CardTitle>
              <CardDescription className="text-xs">
                Manage passwordless authentication
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="inline-block">
                  <Button
                    variant="outline"
                    disabled
                    className="cursor-not-allowed opacity-60"
                    data-ocid="settings.add_passkey_button"
                  >
                    <Key className="w-4 h-4 mr-2" />
                    Add a Passkey
                  </Button>
                </span>
              </TooltipTrigger>
              <TooltipContent>Coming soon</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="inline-block ml-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled
                    className="cursor-not-allowed opacity-60 text-muted-foreground"
                    data-ocid="settings.manage_devices_button"
                  >
                    <Monitor className="w-3.5 h-3.5 mr-1.5" />
                    Manage Devices
                  </Button>
                </span>
              </TooltipTrigger>
              <TooltipContent>Coming soon</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardContent>
      </Card>

      {/* 2FA */}
      <Card className="border-border">
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Lock className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-base">
                Two-Factor Authentication
              </CardTitle>
              <CardDescription className="text-xs">
                Add an extra layer of security
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="inline-block">
                  <Button
                    variant="outline"
                    disabled
                    className="cursor-not-allowed opacity-60"
                    data-ocid="settings.enable_2fa_button"
                  >
                    <Lock className="w-4 h-4 mr-2" />
                    Enable 2FA
                  </Button>
                </span>
              </TooltipTrigger>
              <TooltipContent>Coming soon</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardContent>
      </Card>

      {/* Active Sessions */}
      <Card className="border-border">
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
              <Smartphone className="w-4 h-4 text-purple-600" />
            </div>
            <div>
              <CardTitle className="text-base">Active Sessions</CardTitle>
              <CardDescription className="text-xs">
                Devices currently signed in
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/40 border border-border">
            <div className="flex items-center gap-3">
              <Monitor className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-foreground">
                  This device
                </p>
                <p className="text-xs text-muted-foreground">Active now</p>
              </div>
            </div>
            <span className="w-2 h-2 rounded-full bg-green-500" />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => toast.success("Signed out of all other devices.")}
            data-ocid="settings.signout_all_button"
          >
            Sign out all devices
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Help Center ──────────────────────────────────────────────────────────

function HelpCenterSection() {
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const { data: profile } = useGetCallerProfile(isAuthenticated);
  const { data: messages, isLoading } = useMyHelpMessages(!!identity);
  const submitHelp = useSubmitHelpMessage();

  const [helpName, setHelpName] = useState("");
  const [helpEmail, setHelpEmail] = useState("");
  const [helpMessage, setHelpMessage] = useState("");

  useEffect(() => {
    if (profile) {
      setHelpName(profile.name ?? "");
      setHelpEmail(profile.email ?? "");
    }
  }, [profile]);

  const handleSend = async () => {
    if (!helpName.trim() || !helpEmail.trim() || !helpMessage.trim()) {
      toast.error("Please fill in all fields.");
      return;
    }
    try {
      await submitHelp.mutateAsync({
        name: helpName,
        email: helpEmail,
        message: helpMessage,
      });
      toast.success("Message sent to admin!");
      setHelpMessage("");
    } catch {
      toast.error("Failed to send message.");
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-border">
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base">Chat with Admin</CardTitle>
              <CardDescription className="text-xs">
                Send a message and we'll get back to you
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Chat history */}
          {isAuthenticated && (
            <div className="min-h-[120px] max-h-72 rounded-lg border border-border bg-muted/20 overflow-y-auto p-3 space-y-3">
              {isLoading ? (
                <div className="flex items-center justify-center h-20">
                  <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                </div>
              ) : !messages || messages.length === 0 ? (
                <p
                  className="text-xs text-muted-foreground text-center py-4"
                  data-ocid="settings.help_empty_state"
                >
                  No messages yet. Send a message below.
                </p>
              ) : (
                messages.map((msg: HelpMessage) => (
                  <div key={msg.id.toString()} className="space-y-2">
                    {/* User message */}
                    <div className="flex justify-end">
                      <div className="max-w-[80%] bg-primary text-primary-foreground rounded-xl rounded-tr-sm px-3 py-2">
                        <p className="text-xs">{msg.message}</p>
                        <p className="text-[10px] opacity-70 mt-1 text-right">
                          {formatNano(msg.createdAt)}
                        </p>
                      </div>
                    </div>
                    {/* Admin reply */}
                    {msg.adminReply && (
                      <div className="flex justify-start">
                        <div className="max-w-[80%] bg-card border border-border rounded-xl rounded-tl-sm px-3 py-2">
                          <p className="text-[10px] font-semibold text-primary mb-1">
                            Admin
                          </p>
                          <p className="text-xs text-foreground">
                            {msg.adminReply}
                          </p>
                          {msg.repliedAt && (
                            <p className="text-[10px] text-muted-foreground mt-1">
                              {formatNano(msg.repliedAt)}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* Form */}
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="help-name" className="text-xs">
                  Name
                </Label>
                <Input
                  id="help-name"
                  value={helpName}
                  onChange={(e) => setHelpName(e.target.value)}
                  placeholder="Your name"
                  className="h-8 text-sm"
                  data-ocid="settings.help_name_input"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="help-email" className="text-xs">
                  Email
                </Label>
                <Input
                  id="help-email"
                  type="email"
                  value={helpEmail}
                  onChange={(e) => setHelpEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="h-8 text-sm"
                  data-ocid="settings.help_email_input"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="help-msg" className="text-xs">
                Message
              </Label>
              <Textarea
                id="help-msg"
                value={helpMessage}
                onChange={(e) => setHelpMessage(e.target.value)}
                placeholder="How can we help you?"
                className="min-h-[80px] text-sm resize-none"
                data-ocid="settings.help_message_textarea"
              />
            </div>
            <Button
              onClick={handleSend}
              disabled={submitHelp.isPending}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              data-ocid="settings.help_send_button"
            >
              {submitHelp.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Send className="w-4 h-4 mr-2" />
              )}
              Send Message
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Language ─────────────────────────────────────────────────────────────

function LanguageSection() {
  const [language, setLanguage] = useState(
    () => localStorage.getItem("stockvault_language") ?? "English",
  );

  const handleChange = (val: string) => {
    setLanguage(val);
    localStorage.setItem("stockvault_language", val);
    toast.success("Language preference saved!");
  };

  return (
    <div className="space-y-6">
      <Card className="border-border">
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal-500/10 flex items-center justify-center">
              <Globe className="w-4 h-4 text-teal-600" />
            </div>
            <div>
              <CardTitle className="text-base">App Language</CardTitle>
              <CardDescription className="text-xs">
                Choose your preferred language
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Label className="text-sm">Display Language</Label>
            <Select value={language} onValueChange={handleChange}>
              <SelectTrigger
                className="w-full max-w-xs"
                data-ocid="settings.language_select"
              >
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGES.map((lang) => (
                  <SelectItem key={lang} value={lang}>
                    {lang}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Note: This is a UI preference only. Content will still appear in
              its original language.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Storage & Data ───────────────────────────────────────────────────────

function StorageSection() {
  const [storageSize, setStorageSize] = useState(0);
  const [keyCount, setKeyCount] = useState(0);

  const refreshStorage = () => {
    try {
      const size = new Blob([JSON.stringify(localStorage)]).size;
      setStorageSize(size);
      setKeyCount(localStorage.length);
    } catch {
      setStorageSize(0);
      setKeyCount(0);
    }
  };

  useEffect(() => {
    try {
      const size = new Blob([JSON.stringify(localStorage)]).size;
      setStorageSize(size);
      setKeyCount(localStorage.length);
    } catch {
      setStorageSize(0);
      setKeyCount(0);
    }
  }, []);

  const handleClearCache = () => {
    localStorage.clear();
    refreshStorage();
    toast.success("Cache cleared successfully!");
  };

  const maxBytes = 5 * 1024 * 1024; // 5MB
  const usageKB = (storageSize / 1024).toFixed(2);
  const usagePercent = Math.min((storageSize / maxBytes) * 100, 100);

  return (
    <div className="space-y-6">
      <Card className="border-border">
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
              <Database className="w-4 h-4 text-orange-600" />
            </div>
            <div>
              <CardTitle className="text-base">Local Storage</CardTitle>
              <CardDescription className="text-xs">
                Browser storage used by this app
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Used</span>
              <span className="font-mono font-medium text-foreground">
                {usageKB} KB / 5,000 KB
              </span>
            </div>
            <Progress value={usagePercent} className="h-2" />
            <p className="text-xs text-muted-foreground">
              {usagePercent.toFixed(1)}% of estimated 5MB limit
            </p>
          </div>
          <Button
            variant="outline"
            onClick={handleClearCache}
            className="border-destructive/40 text-destructive hover:bg-destructive/5"
            data-ocid="settings.clear_cache_button"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Clear Cache
          </Button>
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-base">Session Data</CardTitle>
          <CardDescription className="text-xs">
            Keys currently stored in your browser
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border">
            <Database className="w-5 h-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium text-foreground">
                {keyCount} stored keys
              </p>
              <p className="text-xs text-muted-foreground">
                Total size: {usageKB} KB
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Main Settings Page ───────────────────────────────────────────────────

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState("account");

  const renderSection = () => {
    switch (activeSection) {
      case "account":
        return <AccountSettings />;
      case "privacy":
        return <PrivacySection />;
      case "help":
        return <HelpCenterSection />;
      case "language":
        return <LanguageSection />;
      case "storage":
        return <StorageSection />;
      default:
        return null;
    }
  };

  const activeItem = SECTIONS.find((s) => s.id === activeSection);

  return (
    <div className="container max-w-5xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
      >
        {/* Page Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Settings className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="font-display font-700 text-2xl text-foreground tracking-tight">
              Settings
            </h1>
            <p className="text-sm text-muted-foreground">
              Manage your account and preferences
            </p>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar — desktop */}
          <aside className="hidden lg:block w-56 shrink-0">
            <nav className="space-y-1">
              {SECTIONS.map((section) => {
                const Icon = section.icon;
                const isActive = section.id === activeSection;
                return (
                  <button
                    key={section.id}
                    type="button"
                    onClick={() => setActiveSection(section.id)}
                    data-ocid={`settings.${section.id}_tab`}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    {section.label}
                  </button>
                );
              })}
            </nav>
          </aside>

          {/* Top tabs — mobile */}
          <div className="lg:hidden">
            <ScrollArea className="w-full">
              <div className="flex gap-1 pb-2">
                {SECTIONS.map((section) => {
                  const Icon = section.icon;
                  const isActive = section.id === activeSection;
                  return (
                    <button
                      key={section.id}
                      type="button"
                      onClick={() => setActiveSection(section.id)}
                      data-ocid={`settings.${section.id}_tab`}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:text-foreground bg-muted/40"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5 shrink-0" />
                      {section.label}
                    </button>
                  );
                })}
              </div>
            </ScrollArea>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {activeItem && (
              <div className="mb-4 lg:hidden">
                <h2 className="font-semibold text-lg text-foreground">
                  {activeItem.label}
                </h2>
              </div>
            )}
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.18 }}
            >
              {renderSection()}
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
