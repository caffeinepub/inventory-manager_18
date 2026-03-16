import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { Download, ExternalLink, Mail, Search, Shield } from "lucide-react";
import type { Variants } from "motion/react";
import { motion } from "motion/react";
import { useLanguage } from "../context/LanguageContext";

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
  const { t } = useLanguage();
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
              {t("landing.contact_eyebrow")}
            </p>
            <h2 className="font-display font-700 text-3xl sm:text-4xl text-foreground">
              {t("landing.contact_title")}
            </h2>
          </div>

          <div className="bg-card border border-border rounded-2xl p-8 sm:p-10 flex flex-col items-center gap-6 text-center">
            <div className="w-14 h-14 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Mail className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">
                {t("landing.contact_reach_out")}
              </p>
              <a
                href="mailto:raiayush212280@gmail.com"
                className="font-medium text-foreground hover:underline transition-all"
                data-ocid="contact.link"
              >
                raiayush212280@gmail.com
              </a>
            </div>
            <div className="flex flex-wrap gap-3 justify-center">
              <Button
                asChild
                size="lg"
                className="font-600 px-8"
                data-ocid="contact.primary_button"
              >
                <a href="mailto:raiayush212280@gmail.com">
                  <Mail className="w-4 h-4 mr-2" />
                  {t("landing.contact_send_email")}
                </a>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-border hover:border-primary/50 hover:text-primary"
                data-ocid="contact.secondary_button"
              >
                <a
                  href="https://www.linkedin.com/in/ayush-rai-6a89b3269"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  {t("landing.contact_linkedin")}
                </a>
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default function LandingPage() {
  const { t } = useLanguage();

  const features = [
    {
      icon: Search,
      title: t("landing.feature1_title"),
      description: t("landing.feature1_desc"),
      href: "/inventory" as const,
      ocid: "landing.features.card.1",
    },
    {
      icon: Download,
      title: t("landing.feature2_title"),
      description: t("landing.feature2_desc"),
      href: "/inventory" as const,
      ocid: "landing.features.card.2",
    },
    {
      icon: Shield,
      title: t("landing.feature3_title"),
      description: t("landing.feature3_desc"),
      href: "/admin" as const,
      ocid: "landing.features.card.3",
    },
  ];

  const interests = [
    t("landing.about_interest1"),
    t("landing.about_interest2"),
    t("landing.about_interest3"),
  ];

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
            {t("landing.hero_title_1")}{" "}
            <span className="text-primary">{t("landing.hero_title_2")}</span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="text-base sm:text-lg text-muted-foreground max-w-xl leading-relaxed"
          >
            {t("landing.hero_description")}
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
              <Link to="/inventory">{t("landing.hero_cta")}</Link>
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
                {t("landing.hero_admin")}
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
              {t("landing.features_eyebrow")}
            </p>
            <h2 className="font-display font-700 text-3xl sm:text-4xl text-foreground">
              {t("landing.features_title")}
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
                    {href === "/admin"
                      ? t("landing.feature_goto_admin")
                      : t("landing.feature_goto_inventory")}
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
                {t("landing.about_eyebrow")}
              </p>
              <h2 className="font-display font-700 text-2xl text-foreground mb-1">
                {t("landing.about_name")}
              </h2>
              <p className="text-sm text-muted-foreground mb-4">
                {t("landing.about_subtitle")}
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
                  {t("landing.about_linkedin")}
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
