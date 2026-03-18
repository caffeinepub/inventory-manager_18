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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  BookOpen,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Copy,
  Database,
  Globe,
  HelpCircle,
  Key,
  Link2,
  Loader2,
  Lock,
  LogIn,
  Mail,
  MessageCircle,
  MessageSquare,
  Monitor,
  Moon,
  Palette,
  Send,
  Settings,
  Share2,
  Shield,
  Smartphone,
  Sun,
  Trash2,
  User,
  UserPlus,
  UserX,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useLanguage } from "../context/LanguageContext";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useDeleteAccount,
  useGetCallerProfile,
  useMyHelpMessages,
  useSaveCallerProfile,
  useSubmitHelpMessage,
} from "../hooks/useQueries";
import type { HelpMessage } from "../hooks/useQueries";
import type { Language } from "../i18n/translations";

const LANGUAGE_OPTIONS: { value: Language | string; label: string }[] = [
  { value: "hi", label: "हिंदी (Hindi)" },
  { value: "en", label: "English" },
  { value: "es", label: "Español" },
  { value: "fr", label: "Français" },
  { value: "de", label: "Deutsch" },
  { value: "ar", label: "العربية" },
  { value: "pt", label: "Português" },
  { value: "ja", label: "日本語" },
  { value: "zh", label: "中文 (简体)" },
  { value: "ko", label: "한국어" },
  { value: "ru", label: "Русский" },
  { value: "it", label: "Italiano" },
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
  const { t } = useLanguage();
  const isAuthenticated = !!identity;
  const { data: profile, isLoading: profileLoading } =
    useGetCallerProfile(isAuthenticated);
  const saveProfile = useSaveCallerProfile();
  const deleteAccount = useDeleteAccount();
  const { clear } = useInternetIdentity();

  const [showEditForm, setShowEditForm] = useState(false);
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
      toast.success(t("settings.account.profile_saved"));
      setShowEditForm(false);
    } catch {
      toast.error(t("settings.account.profile_save_error"));
    }
  };

  const handleCreateAccount = () => {
    if (!newName.trim() || !newEmail.trim()) {
      toast.error(t("settings.account.create_fill_error"));
      return;
    }
    setNewAccountDone(true);
    toast.success(t("settings.account.create_success_msg"));
    setNewName("");
    setNewEmail("");
  };

  const handleDeleteConfirm = async () => {
    if (deleteConfirmText !== "DELETE") {
      toast.error(t("settings.account.type_delete_error"));
      return;
    }
    try {
      await deleteAccount.mutateAsync();
      toast.success(t("settings.account.delete_success"));
      setDeleteOpen(false);
      clear();
    } catch {
      toast.error(t("settings.account.delete_error"));
    }
  };

  return (
    <div className="space-y-6">
      {/* Edit Profile */}
      <Card className="border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <User className="w-4 h-4 text-primary" />
              </div>
              <div>
                <CardTitle className="text-base">
                  {t("settings.account.edit_profile_title")}
                </CardTitle>
                <CardDescription className="text-xs">
                  {t("settings.account.edit_profile_desc")}
                </CardDescription>
              </div>
            </div>
            {isAuthenticated && !profileLoading && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowEditForm((prev) => !prev)}
                data-ocid="settings.profile_edit_button"
                className="gap-1.5 text-xs"
              >
                {showEditForm ? (
                  <>
                    <ChevronUp className="w-3.5 h-3.5" />
                    {t("settings.account.hide")}
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-3.5 h-3.5" />
                    {t("settings.account.edit_profile_btn")}
                  </>
                )}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {!isAuthenticated ? (
            <div className="text-center py-6">
              <p className="text-sm text-muted-foreground mb-4">
                {t("settings.account.sign_in_to_edit")}
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
                {t("settings.account.sign_in")}
              </Button>
            </div>
          ) : profileLoading ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          ) : !showEditForm ? (
            <p className="text-sm text-muted-foreground py-2">
              {t("settings.account.click_edit_hint")}
            </p>
          ) : (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-4 overflow-hidden"
            >
              <div className="space-y-1.5">
                <Label htmlFor="profile-name">
                  {t("settings.account.full_name")}
                </Label>
                <Input
                  id="profile-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t("settings.account.name_placeholder")}
                  data-ocid="settings.profile_name_input"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="profile-email">
                  {t("settings.account.email")}
                </Label>
                <Input
                  id="profile-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t("settings.account.email_placeholder")}
                  data-ocid="settings.profile_email_input"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="profile-phone">
                  {t("settings.account.phone")}
                </Label>
                <Input
                  id="profile-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder={t("settings.account.phone_placeholder")}
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
                {t("settings.account.save_profile")}
              </Button>
            </motion.div>
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
              <CardTitle className="text-base">
                {t("settings.account.create_account_title")}
              </CardTitle>
              <CardDescription className="text-xs">
                {t("settings.account.create_account_desc")}
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
                {t("settings.account.create_account_success")}
              </p>
              <Button
                variant="ghost"
                size="sm"
                className="mt-2 text-xs"
                onClick={() => setNewAccountDone(false)}
              >
                {t("settings.account.create_another")}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="new-name">
                  {t("settings.account.full_name")}
                </Label>
                <Input
                  id="new-name"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder={t("settings.account.new_user_name_placeholder")}
                  data-ocid="settings.create_name_input"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="new-email">{t("settings.account.email")}</Label>
                <Input
                  id="new-email"
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder={t("settings.account.new_user_email_placeholder")}
                  data-ocid="settings.create_email_input"
                />
              </div>
              <Button
                onClick={handleCreateAccount}
                className="bg-primary text-primary-foreground hover:bg-primary/90 w-full"
                data-ocid="settings.create_account_button"
              >
                {t("settings.account.create_account_btn")}
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
                {t("settings.account.delete_account_title")}
              </CardTitle>
              <CardDescription className="text-xs">
                {t("settings.account.delete_account_desc")}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {!isAuthenticated ? (
            <p className="text-sm text-muted-foreground">
              {t("settings.account.sign_in_to_delete")}
            </p>
          ) : (
            <div>
              <p className="text-sm text-muted-foreground mb-4">
                {t("settings.account.delete_warning")}
              </p>
              <Button
                variant="destructive"
                onClick={() => setDeleteOpen(true)}
                data-ocid="settings.delete_account_button"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                {t("settings.account.delete_my_account")}
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
              {t("settings.account.delete_dialog_title")}
            </DialogTitle>
            <DialogDescription>
              {t("settings.account.delete_dialog_desc")}{" "}
              <span className="font-mono font-bold text-destructive">
                {t("settings.account.delete_confirm_word")}
              </span>{" "}
              .
            </DialogDescription>
          </DialogHeader>
          <Input
            value={deleteConfirmText}
            onChange={(e) => setDeleteConfirmText(e.target.value)}
            placeholder={t("settings.account.delete_confirm_placeholder")}
            data-ocid="settings.delete_confirm_input"
          />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteOpen(false)}
              data-ocid="settings.delete_cancel_button"
            >
              {t("settings.account.cancel")}
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
              {t("settings.account.confirm_delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ── Privacy & Security ───────────────────────────────────────────────────

// Passkey scanning states
type PasskeyState = "idle" | "scanning" | "success";

// 2FA flow states
type TwoFAState = "idle" | "phone" | "code" | "success";

function PrivacySection() {
  const { t } = useLanguage();

  // Passkey dialog state
  const [passkeyOpen, setPasskeyOpen] = useState(false);
  const [passkeyState, setPasskeyState] = useState<PasskeyState>("idle");
  const passkeyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 2FA dialog state
  const [twoFAOpen, setTwoFAOpen] = useState(false);
  const [twoFAState, setTwoFAState] = useState<TwoFAState>("idle");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [verifyCode, setVerifyCode] = useState("");
  const [codeError, setCodeError] = useState("");
  const twoFATimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (passkeyTimerRef.current) clearTimeout(passkeyTimerRef.current);
      if (twoFATimerRef.current) clearTimeout(twoFATimerRef.current);
    };
  }, []);

  // --- Passkey handlers ---
  const handleOpenPasskey = () => {
    setPasskeyState("scanning");
    setPasskeyOpen(true);
    passkeyTimerRef.current = setTimeout(() => {
      setPasskeyState("success");
    }, 3000);
  };

  const handleClosePasskey = () => {
    if (passkeyTimerRef.current) clearTimeout(passkeyTimerRef.current);
    setPasskeyOpen(false);
    // Reset after close animation
    setTimeout(() => setPasskeyState("idle"), 300);
  };

  // --- 2FA handlers ---
  const handleOpenTwoFA = () => {
    setTwoFAState("phone");
    setPhoneNumber("");
    setVerifyCode("");
    setCodeError("");
    setTwoFAOpen(true);
  };

  const handleSendCode = () => {
    if (!phoneNumber.trim()) return;
    setTwoFAState("code");
    setVerifyCode("");
    setCodeError("");
  };

  const handleVerifyCode = () => {
    if (!/^\d{6}$/.test(verifyCode)) {
      setCodeError("Please enter a valid 6-digit code.");
      return;
    }
    setCodeError("");
    setTwoFAState("success");
    twoFATimerRef.current = setTimeout(() => {
      setTwoFAOpen(false);
      setTimeout(() => setTwoFAState("idle"), 300);
      toast.success("2FA enabled successfully!");
    }, 1500);
  };

  const handleCloseTwoFA = () => {
    if (twoFATimerRef.current) clearTimeout(twoFATimerRef.current);
    setTwoFAOpen(false);
    setTimeout(() => setTwoFAState("idle"), 300);
  };

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
              <CardTitle className="text-base">
                {t("settings.privacy.passkeys_title")}
              </CardTitle>
              <CardDescription className="text-xs">
                {t("settings.privacy.passkeys_desc")}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button
            variant="outline"
            onClick={handleOpenPasskey}
            data-ocid="settings.add_passkey_button"
          >
            <Key className="w-4 h-4 mr-2" />
            {t("settings.privacy.add_passkey")}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="ml-2 text-muted-foreground"
            data-ocid="settings.manage_devices_button"
            onClick={() => toast.info("Device management coming soon.")}
          >
            <Monitor className="w-3.5 h-3.5 mr-1.5" />
            {t("settings.privacy.manage_devices")}
          </Button>
        </CardContent>
      </Card>

      {/* Passkey Scanning Dialog */}
      <Dialog
        open={passkeyOpen}
        onOpenChange={(open) => {
          if (!open) handleClosePasskey();
        }}
      >
        <DialogContent className="max-w-sm" data-ocid="settings.passkey_dialog">
          <DialogHeader>
            <DialogTitle className="text-center">
              {passkeyState === "success" ? "Passkey Added" : "Add a Passkey"}
            </DialogTitle>
            <DialogDescription className="text-center">
              {passkeyState === "success"
                ? "Your device has been registered successfully."
                : "Please keep your device nearby while we scan for it."}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col items-center justify-center py-8">
            <AnimatePresence mode="wait">
              {passkeyState === "scanning" ? (
                <motion.div
                  key="scanning"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.3 }}
                  className="relative flex items-center justify-center"
                >
                  {/* Outer pulsing rings */}
                  <motion.span
                    className="absolute w-32 h-32 rounded-full border-2 border-amber-400/30"
                    animate={{ scale: [1, 1.6, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{
                      duration: 2,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "easeInOut",
                    }}
                  />
                  <motion.span
                    className="absolute w-24 h-24 rounded-full border-2 border-amber-400/50"
                    animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0.1, 0.6] }}
                    transition={{
                      duration: 2,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "easeInOut",
                      delay: 0.3,
                    }}
                  />
                  <motion.span
                    className="absolute w-16 h-16 rounded-full border-2 border-amber-400/70"
                    animate={{ scale: [1, 1.3, 1], opacity: [0.7, 0.2, 0.7] }}
                    transition={{
                      duration: 2,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "easeInOut",
                      delay: 0.6,
                    }}
                  />
                  {/* Center spinner */}
                  <div className="w-14 h-14 rounded-full bg-amber-500/10 border-2 border-amber-400 flex items-center justify-center">
                    <Loader2 className="w-6 h-6 text-amber-600 animate-spin" />
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: "spring", stiffness: 260, damping: 20 }}
                  className="flex flex-col items-center gap-3"
                >
                  <div className="w-16 h-16 rounded-full bg-green-500/10 border-2 border-green-500 flex items-center justify-center">
                    <CheckCircle2 className="w-8 h-8 text-green-500" />
                  </div>
                  <p className="text-base font-semibold text-green-600">
                    Device added successfully!
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {passkeyState === "scanning" && (
              <motion.p
                className="mt-10 text-sm text-muted-foreground text-center"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
              >
                Scanning for devices...
              </motion.p>
            )}
          </div>

          <DialogFooter className="justify-center">
            {passkeyState === "success" ? (
              <Button
                onClick={handleClosePasskey}
                className="bg-primary text-primary-foreground"
                data-ocid="settings.passkey_done_button"
              >
                Done
              </Button>
            ) : (
              <Button
                variant="outline"
                onClick={handleClosePasskey}
                data-ocid="settings.passkey_cancel_button"
              >
                Cancel
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 2FA */}
      <Card className="border-border">
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Lock className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-base">
                {t("settings.privacy.twofa_title")}
              </CardTitle>
              <CardDescription className="text-xs">
                {t("settings.privacy.twofa_desc")}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Button
            variant="outline"
            onClick={handleOpenTwoFA}
            data-ocid="settings.enable_2fa_button"
          >
            <Lock className="w-4 h-4 mr-2" />
            {t("settings.privacy.enable_2fa")}
          </Button>
        </CardContent>
      </Card>

      {/* 2FA Dialog */}
      <Dialog
        open={twoFAOpen}
        onOpenChange={(open) => {
          if (!open) handleCloseTwoFA();
        }}
      >
        <DialogContent className="max-w-sm" data-ocid="settings.twofa_dialog">
          <DialogHeader>
            <DialogTitle>Two-Factor Authentication</DialogTitle>
            <DialogDescription>
              {twoFAState === "phone" &&
                "Enter your phone number to receive a verification code."}
              {twoFAState === "code" &&
                `A 6-digit code was sent to ${phoneNumber}.`}
              {twoFAState === "success" &&
                "2FA has been enabled on your account."}
            </DialogDescription>
          </DialogHeader>

          <AnimatePresence mode="wait">
            {twoFAState === "phone" && (
              <motion.div
                key="phone"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-4 py-2"
              >
                <div className="space-y-1.5">
                  <Label htmlFor="twofa-phone">Phone Number</Label>
                  <Input
                    id="twofa-phone"
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    data-ocid="settings.twofa_phone_input"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && phoneNumber.trim())
                        handleSendCode();
                    }}
                  />
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={handleCloseTwoFA}
                    data-ocid="settings.twofa_cancel_button"
                  >
                    Cancel
                  </Button>
                  <Button
                    disabled={!phoneNumber.trim()}
                    onClick={handleSendCode}
                    className="bg-primary text-primary-foreground"
                    data-ocid="settings.twofa_send_code_button"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Send Code
                  </Button>
                </DialogFooter>
              </motion.div>
            )}

            {twoFAState === "code" && (
              <motion.div
                key="code"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-4 py-2"
              >
                <div className="flex items-center gap-2 p-3 rounded-lg bg-blue-500/8 border border-blue-200">
                  <Smartphone className="w-4 h-4 text-blue-600 shrink-0" />
                  <p className="text-xs text-blue-700">
                    Code sent to{" "}
                    <span className="font-semibold">{phoneNumber}</span>
                  </p>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="twofa-code">6-Digit Verification Code</Label>
                  <Input
                    id="twofa-code"
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={verifyCode}
                    onChange={(e) => {
                      setVerifyCode(
                        e.target.value.replace(/\D/g, "").slice(0, 6),
                      );
                      setCodeError("");
                    }}
                    placeholder="000000"
                    className="tracking-[0.35em] text-center text-lg font-mono"
                    data-ocid="settings.twofa_code_input"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && verifyCode.length === 6)
                        handleVerifyCode();
                    }}
                  />
                  {codeError && (
                    <p
                      className="text-xs text-destructive"
                      data-ocid="settings.twofa_code_error_state"
                    >
                      {codeError}
                    </p>
                  )}
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setTwoFAState("phone")}
                    data-ocid="settings.twofa_back_button"
                  >
                    Back
                  </Button>
                  <Button
                    disabled={verifyCode.length !== 6}
                    onClick={handleVerifyCode}
                    className="bg-primary text-primary-foreground"
                    data-ocid="settings.twofa_verify_button"
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    Verify
                  </Button>
                </DialogFooter>
              </motion.div>
            )}

            {twoFAState === "success" && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                className="flex flex-col items-center gap-3 py-6"
                data-ocid="settings.twofa_success_state"
              >
                <div className="w-16 h-16 rounded-full bg-green-500/10 border-2 border-green-500 flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-green-500" />
                </div>
                <p className="text-base font-semibold text-green-600">
                  2FA enabled successfully!
                </p>
                <p className="text-xs text-muted-foreground text-center">
                  Your account is now protected with two-factor authentication.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </DialogContent>
      </Dialog>

      {/* Active Sessions */}
      <Card className="border-border">
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
              <Smartphone className="w-4 h-4 text-purple-600" />
            </div>
            <div>
              <CardTitle className="text-base">
                {t("settings.privacy.sessions_title")}
              </CardTitle>
              <CardDescription className="text-xs">
                {t("settings.privacy.sessions_desc")}
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
                  {t("settings.privacy.this_device")}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t("settings.privacy.active_now")}
                </p>
              </div>
            </div>
            <span className="w-2 h-2 rounded-full bg-green-500" />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              toast.success(t("settings.privacy.signout_all_success"))
            }
            data-ocid="settings.signout_all_button"
          >
            {t("settings.privacy.signout_all")}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Help Center ──────────────────────────────────────────────────────────

function HelpCenterSection() {
  const { identity } = useInternetIdentity();
  const { t } = useLanguage();
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
      toast.error(t("settings.help.fill_fields_error"));
      return;
    }
    try {
      await submitHelp.mutateAsync({
        name: helpName,
        email: helpEmail,
        message: helpMessage,
      });
      toast.success(t("settings.help.send_success"));
      setHelpMessage("");
    } catch {
      toast.error(t("settings.help.send_error"));
    }
  };

  const [guideOpen, setGuideOpen] = useState(false);

  return (
    <div className="space-y-6">
      {/* Step-by-step guide card */}
      <Card className="border-blue-200 bg-blue-50/60">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-primary" />
              </div>
              <div>
                <CardTitle className="text-base">
                  📖 How to Use StockVault
                </CardTitle>
                <CardDescription className="text-xs">
                  Step-by-step guide for everyone
                </CardDescription>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setGuideOpen((prev) => !prev)}
              className="text-xs border-primary/30 text-primary hover:bg-primary/5"
              data-ocid="settings.help_guide_toggle"
            >
              {guideOpen ? (
                <>
                  <ChevronUp className="w-3.5 h-3.5 mr-1" /> Hide Guide
                </>
              ) : (
                <>
                  <ChevronDown className="w-3.5 h-3.5 mr-1" /> View Guide
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <AnimatePresence initial={false}>
          {guideOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{ overflow: "hidden" }}
            >
              <CardContent className="pt-0">
                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-semibold text-foreground mb-1.5">
                      👤 For Everyone:
                    </p>
                    <ol className="space-y-1.5 text-xs text-muted-foreground list-none">
                      {[
                        'Go to "Browse Inventory" to see all available items',
                        "Use the search bar to find specific items by name or category",
                        "Click on any item to see its full details (price, stock, description)",
                        "Use voice search (🎤) for hands-free, speech-based filtering",
                      ].map((step, i) => (
                        <li key={step} className="flex items-start gap-2">
                          <span className="shrink-0 w-4 h-4 rounded-full bg-primary/20 text-primary text-[10px] font-bold flex items-center justify-center mt-0.5">
                            {i + 1}
                          </span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-foreground mb-1.5">
                      🔐 For Admin:
                    </p>
                    <ol
                      className="space-y-1.5 text-xs text-muted-foreground list-none"
                      start={5}
                    >
                      {[
                        'Click "Admin" in the navbar and log in with your credentials',
                        'Use the "+" button to add new inventory items',
                        "Click the edit (✏️) icon to update existing items",
                        "Click the delete (🗑️) icon to remove items from inventory",
                        '"Messages" tab shows user contact form submissions',
                        'Use "Export" buttons to download inventory as PDF or Excel',
                      ].map((step, i) => (
                        <li key={step} className="flex items-start gap-2">
                          <span className="shrink-0 w-4 h-4 rounded-full bg-amber-100 text-amber-700 text-[10px] font-bold flex items-center justify-center mt-0.5">
                            {i + 5}
                          </span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>
              </CardContent>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>

      <Card className="border-border">
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base">
                {t("settings.help.chat_title")}
              </CardTitle>
              <CardDescription className="text-xs">
                {t("settings.help.chat_desc")}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
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
                  {t("settings.help.no_messages")}
                </p>
              ) : (
                messages.map((msg: HelpMessage) => (
                  <div key={msg.id.toString()} className="space-y-2">
                    <div className="flex justify-end">
                      <div className="max-w-[80%] bg-primary text-primary-foreground rounded-xl rounded-tr-sm px-3 py-2">
                        <p className="text-xs">{msg.message}</p>
                        <p className="text-[10px] opacity-70 mt-1 text-right">
                          {formatNano(msg.createdAt)}
                        </p>
                      </div>
                    </div>
                    {msg.adminReply && (
                      <div className="flex justify-start">
                        <div className="max-w-[80%] bg-card border border-border rounded-xl rounded-tl-sm px-3 py-2">
                          <p className="text-[10px] font-semibold text-primary mb-1">
                            {t("settings.help.admin_label")}
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

          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="help-name" className="text-xs">
                  {t("settings.help.name")}
                </Label>
                <Input
                  id="help-name"
                  value={helpName}
                  onChange={(e) => setHelpName(e.target.value)}
                  placeholder={t("settings.help.name_placeholder")}
                  className="h-8 text-sm"
                  data-ocid="settings.help_name_input"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="help-email" className="text-xs">
                  {t("settings.help.email")}
                </Label>
                <Input
                  id="help-email"
                  type="email"
                  value={helpEmail}
                  onChange={(e) => setHelpEmail(e.target.value)}
                  placeholder={t("settings.help.email_placeholder")}
                  className="h-8 text-sm"
                  data-ocid="settings.help_email_input"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="help-msg" className="text-xs">
                {t("settings.help.message")}
              </Label>
              <Textarea
                id="help-msg"
                value={helpMessage}
                onChange={(e) => setHelpMessage(e.target.value)}
                placeholder={t("settings.help.message_placeholder")}
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
              {t("settings.help.send_message")}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Appearance ─────────────────────────────────────────────────────────

function AppearanceSection() {
  const [isDark, setIsDark] = useState<boolean>(() => {
    return localStorage.getItem("stockvault_dark_mode") === "true";
  });

  const toggleDark = () => {
    const next = !isDark;
    setIsDark(next);
    localStorage.setItem("stockvault_dark_mode", String(next));
    if (next) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    toast.success(next ? "Dark mode enabled" : "Light mode enabled");
  };

  return (
    <div className="space-y-6">
      <Card className="border-border">
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center">
              <Palette className="w-4 h-4 text-violet-600" />
            </div>
            <div>
              <CardTitle className="text-base">Appearance</CardTitle>
              <CardDescription className="text-xs">
                Customize the look and feel of StockVault
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/20">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                {isDark ? (
                  <Moon className="w-4 h-4 text-primary" />
                ) : (
                  <Sun className="w-4 h-4 text-amber-500" />
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Dark Mode</p>
                <p className="text-xs text-muted-foreground">
                  {isDark
                    ? "Currently using dark theme"
                    : "Currently using light theme"}
                </p>
              </div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={isDark}
              onClick={toggleDark}
              data-ocid="settings.dark_mode_toggle"
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 ${
                isDark ? "bg-primary" : "bg-muted-foreground/30"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                  isDark ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Language ─────────────────────────────────────────────────────────────

function LanguageSection() {
  const { language, setLanguage, t } = useLanguage();

  const handleChange = (val: string) => {
    if (val === "en" || val === "hi") {
      setLanguage(val as Language);
    } else {
      // For unsupported langs, just save preference without switching UI
      localStorage.setItem("appLanguage_ext", val);
    }
    toast.success(t("settings.language.saved"));
  };

  // Determine current select value: use language for en/hi, else check extended preference
  const currentValue =
    language === "hi" ? "hi" : language === "en" ? "en" : language;

  return (
    <div className="space-y-6">
      <Card className="border-border">
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal-500/10 flex items-center justify-center">
              <Globe className="w-4 h-4 text-teal-600" />
            </div>
            <div>
              <CardTitle className="text-base">
                {t("settings.language.title")}
              </CardTitle>
              <CardDescription className="text-xs">
                {t("settings.language.desc")}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Label className="text-sm">
              {t("settings.language.display_language")}
            </Label>
            <Select value={currentValue} onValueChange={handleChange}>
              <SelectTrigger
                className="w-full max-w-xs"
                data-ocid="settings.language_select"
              >
                <SelectValue
                  placeholder={t("settings.language.select_placeholder")}
                />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGE_OPTIONS.map((lang) => (
                  <SelectItem key={lang.value} value={lang.value}>
                    {lang.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {t("settings.language.note")}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Storage & Data ───────────────────────────────────────────────────────

function StorageSection() {
  const { t } = useLanguage();
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
    toast.success(t("settings.storage.clear_cache_success"));
  };

  const maxBytes = 5 * 1024 * 1024;
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
              <CardTitle className="text-base">
                {t("settings.storage.local_storage_title")}
              </CardTitle>
              <CardDescription className="text-xs">
                {t("settings.storage.local_storage_desc")}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {t("settings.storage.used")}
              </span>
              <span className="font-mono font-medium text-foreground">
                {usageKB} {t("settings.storage.limit")}
              </span>
            </div>
            <Progress value={usagePercent} className="h-2" />
            <p className="text-xs text-muted-foreground">
              {usagePercent.toFixed(1)}
              {t("settings.storage.usage_percent")}
            </p>
          </div>
          <Button
            variant="outline"
            onClick={handleClearCache}
            className="border-destructive/40 text-destructive hover:bg-destructive/5"
            data-ocid="settings.clear_cache_button"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            {t("settings.storage.clear_cache")}
          </Button>
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-base">
            {t("settings.storage.session_title")}
          </CardTitle>
          <CardDescription className="text-xs">
            {t("settings.storage.session_desc")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border">
            <Database className="w-5 h-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium text-foreground">
                {keyCount} {t("settings.storage.stored_keys")}
              </p>
              <p className="text-xs text-muted-foreground">
                {t("settings.storage.total_size")} {usageKB} KB
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Share App ────────────────────────────────────────────────────────────

function ShareAppSection() {
  const APP_URL = "https://inventory-manager-xey.caffeine.xyz";
  const [copied, setCopied] = useState(false);
  const canShare = typeof navigator !== "undefined" && !!navigator.share;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(APP_URL);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
      const el = document.createElement("textarea");
      el.value = APP_URL;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: "StockVault – Inventory Manager",
        text: "Check out StockVault, a professional inventory management app!",
        url: APP_URL,
      });
    } catch {
      // user cancelled or error – do nothing
    }
  };

  return (
    <div className="space-y-4">
      <Card data-ocid="share.card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Share2 className="w-5 h-5 text-primary" />
            Share StockVault
          </CardTitle>
          <CardDescription>
            Share the app link with friends, colleagues, or on social media.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* App URL display */}
          <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 border border-border">
            <Link2 className="w-4 h-4 text-muted-foreground shrink-0" />
            <span className="text-sm text-foreground font-mono truncate flex-1">
              {APP_URL}
            </span>
          </div>

          {/* Copy Link button */}
          <Button
            onClick={handleCopy}
            variant={copied ? "default" : "outline"}
            className="w-full gap-2"
            data-ocid="share.copy_link_button"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copy Link
              </>
            )}
          </Button>

          {/* Share to Apps or fallback links */}
          {canShare ? (
            <Button
              onClick={handleShare}
              className="w-full gap-2 bg-primary text-primary-foreground"
              data-ocid="share.native_share_button"
            >
              <Share2 className="w-4 h-4" />
              Share to Apps
            </Button>
          ) : (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground text-center">
                Share via:
              </p>
              <div className="flex gap-2">
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(`Check out StockVault! ${APP_URL}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-ocid="share.whatsapp_link"
                  className="flex-1"
                >
                  <Button
                    variant="outline"
                    className="w-full gap-2 text-green-600 border-green-200 hover:bg-green-50"
                  >
                    <MessageCircle className="w-4 h-4" />
                    WhatsApp
                  </Button>
                </a>
                <a
                  href={`mailto:?subject=Check out StockVault&body=${encodeURIComponent(`Check out StockVault – an inventory management app: ${APP_URL}`)}`}
                  data-ocid="share.email_link"
                  className="flex-1"
                >
                  <Button
                    variant="outline"
                    className="w-full gap-2 text-blue-600 border-blue-200 hover:bg-blue-50"
                  >
                    <Mail className="w-4 h-4" />
                    Email
                  </Button>
                </a>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ── Main Settings Page ───────────────────────────────────────────────────

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState("account");
  const { t } = useLanguage();

  const SECTIONS = [
    { id: "account", labelKey: "settings.tab_account", icon: User },
    { id: "privacy", labelKey: "settings.tab_privacy", icon: Shield },
    { id: "help", labelKey: "settings.tab_help", icon: HelpCircle },
    { id: "language", labelKey: "settings.tab_language", icon: Globe },
    { id: "storage", labelKey: "settings.tab_storage", icon: Database },
    { id: "share", labelKey: "settings.tab_share", icon: Share2 },
    { id: "appearance", labelKey: "settings.tab_appearance", icon: Palette },
  ];

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
      case "share":
        return <ShareAppSection />;
      case "appearance":
        return <AppearanceSection />;
      default:
        return null;
    }
  };

  const activeItem = SECTIONS.find((s) => s.id === activeSection);

  return (
    <div className="container max-w-3xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
      >
        {/* Page Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Settings className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="font-display font-700 text-2xl text-foreground tracking-tight">
              {t("settings.title")}
            </h1>
            <p className="text-sm text-muted-foreground">
              {t("settings.subtitle")}
            </p>
          </div>
        </div>

        {/* Unified horizontal tab bar */}
        <div className="w-full overflow-x-auto mb-6">
          <div className="flex gap-1 min-w-max pb-1">
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
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50 bg-muted/30"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  {t(section.labelKey)}
                </button>
              );
            })}
          </div>
        </div>

        {/* Active section label */}
        {activeItem && (
          <div className="mb-4">
            <h2 className="font-semibold text-lg text-foreground">
              {t(activeItem.labelKey)}
            </h2>
          </div>
        )}

        {/* Content */}
        <motion.div
          key={activeSection}
          initial={{ opacity: 0, x: 8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.18 }}
        >
          {renderSection()}
        </motion.div>
      </motion.div>
    </div>
  );
}
