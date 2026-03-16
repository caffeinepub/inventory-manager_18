import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Link } from "@tanstack/react-router";
import { Download, ExternalLink, Mail, Search, Shield } from "lucide-react";
import type { Variants } from "motion/react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useSubmitContactMessage } from "../hooks/useQueries";

const features = [
  {
    icon: Search,
    title: "Smart Search",
    description:
      "Instantly find any item by name, category, or SKU. Real-time filtering keeps your workflow fast.",
    href: "/inventory" as const,
    ocid: "landing.features.card.1",
  },
  {
    icon: Download,
    title: "CSV Export",
    description:
      "Download your complete inventory in one click. Share reports, back up data, or import elsewhere.",
    href: "/inventory" as const,
    ocid: "landing.features.card.2",
  },
  {
    icon: Shield,
    title: "Admin Panel",
    description:
      "Secure, login-protected CRUD management. Add, edit, and remove items with confidence.",
    href: "/admin" as const,
    ocid: "landing.features.card.3",
  },
];

const interests = ["Data Analysis", "Cyber Security", "Photography"];

const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12 },
  },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] },
  },
};

function ContactSection() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const submitMessage = useSubmitContactMessage();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await submitMessage.mutateAsync(form);
      setSubmitted(true);
    } catch {
      toast.error("Failed to send message. Please try again.");
    }
  }

  return (
    <section
      className="py-20 px-4 bg-card/40 border-t border-border"
      data-ocid="contact.section"
    >
      <div className="container max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45 }}
        >
          <div className="text-center mb-10">
            <p className="text-xs font-mono text-primary uppercase tracking-widest mb-2">
              Get in touch
            </p>
            <h2 className="font-display font-700 text-3xl sm:text-4xl text-foreground">
              Contact Me
            </h2>
          </div>

          <div className="bg-card border border-border rounded-2xl p-8 sm:p-10 flex flex-col gap-8">
            {/* Contact Info */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4 text-primary" />
                </div>
                <a
                  href="mailto:raiayush212280@gmail.com"
                  className="font-medium text-foreground hover:underline transition-all"
                  data-ocid="contact.link"
                >
                  raiayush212280@gmail.com
                </a>
              </div>
              <Button
                asChild
                size="sm"
                variant="outline"
                className="border-border hover:border-primary/50 hover:text-primary"
                data-ocid="contact.secondary_button"
              >
                <a
                  href="https://www.linkedin.com/in/ayush-rai-6a89b3269"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="w-3.5 h-3.5 mr-2" />
                  Quick Chat on LinkedIn
                </a>
              </Button>
            </div>

            <div className="border-t border-border" />

            {/* Form */}
            {submitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.35 }}
                className="flex flex-col items-center gap-3 py-8 text-center"
                data-ocid="contact.success_state"
              >
                <div className="w-12 h-12 rounded-full bg-primary/15 border-2 border-primary/30 flex items-center justify-center">
                  <Mail className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-display font-700 text-lg text-foreground">
                  Thank you for reaching out!
                </h3>
                <p className="text-sm text-muted-foreground max-w-xs">
                  Your message has been received. I'll get back to you soon.
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-2 border-primary/40 text-primary hover:bg-primary/5"
                  onClick={() => {
                    setSubmitted(false);
                    setForm({ name: "", email: "", message: "" });
                  }}
                  data-ocid="contact.button"
                >
                  Send another message
                </Button>
              </motion.div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="flex flex-col gap-5"
                data-ocid="contact.panel"
              >
                <div className="grid sm:grid-cols-2 gap-5">
                  <div className="flex flex-col gap-1.5">
                    <Label
                      htmlFor="contact-name"
                      className="text-sm font-medium text-foreground"
                    >
                      Name
                    </Label>
                    <Input
                      id="contact-name"
                      placeholder="Your name"
                      value={form.name}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, name: e.target.value }))
                      }
                      required
                      disabled={submitMessage.isPending}
                      data-ocid="contact.input"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label
                      htmlFor="contact-email"
                      className="text-sm font-medium text-foreground"
                    >
                      Email
                    </Label>
                    <Input
                      id="contact-email"
                      type="email"
                      placeholder="your@email.com"
                      value={form.email}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, email: e.target.value }))
                      }
                      required
                      disabled={submitMessage.isPending}
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label
                    htmlFor="contact-message"
                    className="text-sm font-medium text-foreground"
                  >
                    Message
                  </Label>
                  <Textarea
                    id="contact-message"
                    placeholder="Write your message here..."
                    rows={4}
                    value={form.message}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, message: e.target.value }))
                    }
                    required
                    disabled={submitMessage.isPending}
                    data-ocid="contact.textarea"
                  />
                </div>
                <Button
                  type="submit"
                  className="self-start font-600 px-8"
                  disabled={submitMessage.isPending}
                  data-ocid="contact.submit_button"
                >
                  {submitMessage.isPending ? (
                    <>
                      <span className="w-4 h-4 mr-2 border-2 border-current border-t-transparent rounded-full animate-spin inline-block" />
                      Sending...
                    </>
                  ) : (
                    "Send Message"
                  )}
                </Button>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default function LandingPage() {
  return (
    <div className="flex flex-col">
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/10 via-background to-background pt-20 pb-28 px-4">
        <div className="pointer-events-none absolute -top-32 -left-32 w-96 h-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 right-0 w-72 h-72 rounded-full bg-primary/8 blur-2xl" />

        <motion.div
          className="relative container max-w-4xl mx-auto text-center flex flex-col items-center gap-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={fadeUp}>
            <img
              src="/assets/generated/stockvault-logo-transparent.dim_400x100.png"
              alt="StockVault"
              className="h-16 sm:h-20 w-auto object-contain mx-auto"
            />
          </motion.div>

          <motion.h1
            variants={fadeUp}
            className="font-display font-700 text-4xl sm:text-5xl lg:text-6xl text-foreground tracking-tight leading-tight"
          >
            Your Inventory, <span className="text-primary">Under Control</span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="text-base sm:text-lg text-muted-foreground max-w-xl leading-relaxed"
          >
            StockVault gives you a clean, fast interface to track every item you
            own &mdash; search in real time, export to CSV, and manage
            everything securely from one place.
          </motion.p>

          <motion.div
            variants={fadeUp}
            className="flex gap-3 flex-wrap justify-center"
          >
            <Button
              asChild
              size="lg"
              className="font-600 px-8 cursor-pointer hover:opacity-90 active:scale-95 transition-all duration-200"
              data-ocid="landing.hero_button"
            >
              <Link to="/inventory">Browse Inventory</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-primary/40 text-primary cursor-pointer hover:bg-primary/10 hover:border-primary hover:text-primary active:scale-95 transition-all duration-200"
              data-ocid="landing.admin_link"
            >
              <Link to="/admin">
                <Shield className="w-4 h-4 mr-2" />
                Admin Login
              </Link>
            </Button>
          </motion.div>
        </motion.div>
      </section>

      {/* ── Features ─────────────────────────────────────────── */}
      <section
        className="py-20 px-4 bg-card/40 border-y border-border"
        data-ocid="landing.features.section"
      >
        <div className="container max-w-5xl mx-auto">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45 }}
          >
            <p className="text-xs font-mono text-primary uppercase tracking-widest mb-2">
              What you get
            </p>
            <h2 className="font-display font-700 text-3xl sm:text-4xl text-foreground">
              Everything you need
            </h2>
          </motion.div>

          <motion.div
            className="grid sm:grid-cols-3 gap-6"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {features.map(({ icon: Icon, title, description, href, ocid }) => (
              <Link to={href} key={title} className="block group">
                <motion.div
                  variants={fadeUp}
                  data-ocid={ocid}
                  className="bg-card border border-border rounded-xl p-6 flex flex-col gap-4 cursor-pointer transition-all duration-200 hover:border-primary/60 hover:shadow-lg hover:-translate-y-1 group-focus-visible:ring-2 group-focus-visible:ring-primary group-focus-visible:ring-offset-2 h-full"
                >
                  <div className="w-11 h-11 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center transition-colors duration-200 group-hover:bg-primary/20">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-display font-700 text-base text-foreground mb-1 group-hover:text-primary transition-colors duration-200">
                      {title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {description}
                    </p>
                  </div>
                  <span className="mt-auto text-xs font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    {href === "/admin" ? "Go to Admin →" : "Browse Inventory →"}
                  </span>
                </motion.div>
              </Link>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── About the Developer ──────────────────────────────── */}
      <section className="py-20 px-4" data-ocid="about.section">
        <div className="container max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45 }}
            className="bg-card border border-border rounded-2xl p-8 sm:p-10 flex flex-col sm:flex-row gap-8 items-start"
          >
            <div className="w-16 h-16 shrink-0 rounded-full bg-primary/15 border-2 border-primary/30 flex items-center justify-center text-2xl font-display font-700 text-primary">
              AR
            </div>
            <div className="flex-1">
              <p className="text-xs font-mono text-primary uppercase tracking-widest mb-2">
                About the Developer
              </p>
              <h2 className="font-display font-700 text-2xl text-foreground mb-1">
                Ayush Rai
              </h2>
              <p className="text-sm text-muted-foreground mb-4">
                BBA Student &mdash; BBS Group of Institutions
              </p>
              <div className="flex flex-wrap gap-2 mb-6">
                {interests.map((interest) => (
                  <Badge
                    key={interest}
                    variant="secondary"
                    className="text-xs border-border"
                  >
                    {interest}
                  </Badge>
                ))}
              </div>
              <Button
                asChild
                size="sm"
                variant="outline"
                className="border-border hover:border-primary/50 hover:text-primary"
                data-ocid="about.linkedin_button"
              >
                <a
                  href="https://www.linkedin.com/in/ayush-rai-6a89b3269"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="w-3.5 h-3.5 mr-2" />
                  LinkedIn Profile
                </a>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Contact Me ───────────────────────────────────────── */}
      <ContactSection />
    </div>
  );
}
