import { Button } from "@/components/ui/button";
import { Award, Download, Shield } from "lucide-react";
import { useEffect, useRef, useState } from "react";

function GoldMedalBadge({ label }: { label: string }) {
  return (
    <div
      className="flex flex-col items-center gap-1"
      style={{ fontFamily: "Georgia, serif" }}
    >
      <div
        style={{
          width: 72,
          height: 72,
          borderRadius: "50%",
          background:
            "radial-gradient(circle at 35% 35%, #ffe066 0%, #f5c518 40%, #b8860b 75%, #7a5800 100%)",
          boxShadow:
            "0 4px 16px rgba(181,136,11,0.55), inset 0 2px 6px rgba(255,240,120,0.5), inset 0 -2px 4px rgba(100,70,0,0.4)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: "3px solid #c9960c",
          position: "relative",
        }}
      >
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: "50%",
            border: "2px solid rgba(255,240,120,0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Shield
            style={{ width: 22, height: 22, color: "#7a5800", opacity: 0.9 }}
          />
        </div>
      </div>
      <div
        style={{
          background:
            "linear-gradient(90deg, #b8860b 0%, #f5c518 50%, #b8860b 100%)",
          color: "#3d2800",
          fontWeight: 700,
          fontSize: 10,
          letterSpacing: "0.08em",
          padding: "3px 14px",
          borderRadius: 3,
          textTransform: "uppercase",
          boxShadow: "0 2px 6px rgba(181,136,11,0.4)",
          whiteSpace: "nowrap",
        }}
      >
        {label}
      </div>
    </div>
  );
}

type CornerPosition = "tl" | "tr" | "bl" | "br";
const CORNER_CONFIGS: { pos: string; corner: CornerPosition }[] = [
  { pos: "top-0 left-0", corner: "tl" },
  { pos: "top-0 right-0", corner: "tr" },
  { pos: "bottom-0 left-0", corner: "bl" },
  { pos: "bottom-0 right-0", corner: "br" },
];

function CornerOrnament({
  pos,
  corner,
}: { pos: string; corner: CornerPosition }) {
  const paths: Record<CornerPosition, string> = {
    tl: "M4 4 L36 4 M4 4 L4 36 M4 4 Q20 4 20 20 Q4 20 4 4",
    tr: "M76 4 L44 4 M76 4 L76 36 M76 4 Q60 4 60 20 Q76 20 76 4",
    bl: "M4 76 L36 76 M4 76 L4 44 M4 76 Q20 76 20 60 Q4 60 4 76",
    br: "M76 76 L44 76 M76 76 L76 44 M76 76 Q60 76 60 60 Q76 60 76 76",
  };
  const cx: Record<CornerPosition, number> = { tl: 12, tr: 68, bl: 12, br: 68 };
  const cy: Record<CornerPosition, number> = { tl: 12, tr: 12, bl: 68, br: 68 };
  return (
    <div
      className={`absolute ${pos}`}
      style={{ width: 80, height: 80, opacity: 0.45 }}
    >
      <svg
        viewBox="0 0 80 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="Corner ornament"
      >
        <title>Corner ornament</title>
        <path
          d={paths[corner]}
          stroke="#b8860b"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <circle
          cx={cx[corner]}
          cy={cy[corner]}
          r="4"
          fill="#f5c518"
          opacity="0.8"
        />
      </svg>
    </div>
  );
}

// Draw certificate onto a canvas using Canvas 2D API -- works on all browsers including iOS
async function drawCertificateToCanvas(): Promise<HTMLCanvasElement> {
  const W = 1560;
  const H = 1100;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  // Wait for fonts
  await document.fonts.ready;

  // Background gradient
  const bg = ctx.createLinearGradient(0, 0, W * 0.7, H);
  bg.addColorStop(0, "#fdf6e3");
  bg.addColorStop(0.55, "#fef9f0");
  bg.addColorStop(1, "#fdf0d5");
  ctx.fillStyle = bg;
  ctx.roundRect(0, 0, W, H, 20);
  ctx.fill();

  // Outer gold border
  ctx.strokeStyle = "#c9960c";
  ctx.globalAlpha = 0.45;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.roundRect(28, 28, W - 56, H - 56, 12);
  ctx.stroke();

  // Inner thin border
  ctx.globalAlpha = 0.25;
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = "#d4a017";
  ctx.beginPath();
  ctx.roundRect(40, 40, W - 80, H - 80, 8);
  ctx.stroke();
  ctx.globalAlpha = 1;

  // Gold horizontal lines for header divider
  const lineGrad = ctx.createLinearGradient(80, 0, W - 80, 0);
  lineGrad.addColorStop(0, "transparent");
  lineGrad.addColorStop(0.5, "#b8860b");
  lineGrad.addColorStop(1, "transparent");
  ctx.strokeStyle = lineGrad;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(80, 130);
  ctx.lineTo(W - 80, 130);
  ctx.stroke();

  // ── "This Certificate is Proudly Presented to" ──
  ctx.fillStyle = "#8a6200";
  ctx.font = "600 22px Georgia, serif";
  ctx.textAlign = "center";
  ctx.letterSpacing = "4px";
  ctx.fillText("THIS CERTIFICATE IS PROUDLY PRESENTED TO", W / 2, 100);
  ctx.letterSpacing = "0px";

  // ── Certificate of Achievement title ──
  ctx.fillStyle = "#1a2e4a";
  ctx.font = "800 72px Georgia, serif";
  ctx.fillText("Certificate of Achievement", W / 2, 210);

  // Gold underline accent
  const accentGrad = ctx.createLinearGradient(W / 2 - 120, 0, W / 2 + 120, 0);
  accentGrad.addColorStop(0, "#f5c518");
  accentGrad.addColorStop(0.5, "#b8860b");
  accentGrad.addColorStop(1, "#f5c518");
  ctx.fillStyle = accentGrad;
  ctx.fillRect(W / 2 - 80, 224, 160, 5);

  // ── Recipient name in calligraphy ──
  ctx.fillStyle = "#1a2e4a";
  ctx.font = "italic 110px 'Great Vibes', cursive";
  ctx.fillText("Ayush Rai", W / 2, 360);

  // ── Title below name ──
  ctx.fillStyle = "#b8860b";
  ctx.font = "700 26px Georgia, serif";
  ctx.letterSpacing = "3px";
  ctx.fillText("LEAD APP DEVELOPER & FOUNDER, STOCKVAULT", W / 2, 410);
  ctx.letterSpacing = "0px";

  // ── Decorative dot divider ──
  const dotY = 460;
  const dots = [-20, 0, 20];
  for (const dx of dots) {
    ctx.beginPath();
    ctx.arc(W / 2 + dx, dotY, 5, 0, Math.PI * 2);
    ctx.fillStyle = dx === 0 ? "#f5c518" : "#b8860b";
    ctx.fill();
  }
  // Thin lines flanking dots
  const divGradL = ctx.createLinearGradient(80, 0, W / 2 - 40, 0);
  divGradL.addColorStop(0, "transparent");
  divGradL.addColorStop(1, "rgba(201,150,12,0.4)");
  ctx.strokeStyle = divGradL;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(80, dotY);
  ctx.lineTo(W / 2 - 40, dotY);
  ctx.stroke();
  const divGradR = ctx.createLinearGradient(W / 2 + 40, 0, W - 80, 0);
  divGradR.addColorStop(0, "rgba(201,150,12,0.4)");
  divGradR.addColorStop(1, "transparent");
  ctx.strokeStyle = divGradR;
  ctx.beginPath();
  ctx.moveTo(W / 2 + 40, dotY);
  ctx.lineTo(W - 80, dotY);
  ctx.stroke();

  // ── Description ──
  ctx.fillStyle = "#3d3020";
  ctx.font = "italic 28px Georgia, serif";
  const desc =
    "For the innovative development and successful deployment of StockVault,";
  const desc2 =
    "a 100% Secure Inventory Management Application with Voice Search and Multilingual support.";
  ctx.fillText(desc, W / 2, 520);
  ctx.fillText(desc2, W / 2, 560);

  // ── Gold medal badges ──
  const drawBadge = (cx: number, cy: number, label: string) => {
    // Circle
    const grad = ctx.createRadialGradient(cx - 20, cy - 20, 5, cx, cy, 60);
    grad.addColorStop(0, "#ffe066");
    grad.addColorStop(0.4, "#f5c518");
    grad.addColorStop(0.75, "#b8860b");
    grad.addColorStop(1, "#7a5800");
    ctx.beginPath();
    ctx.arc(cx, cy, 60, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.strokeStyle = "#c9960c";
    ctx.lineWidth = 3;
    ctx.stroke();
    // Inner ring
    ctx.beginPath();
    ctx.arc(cx, cy, 44, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(255,240,120,0.7)";
    ctx.lineWidth = 2;
    ctx.stroke();
    // Ribbon
    const rW = 140;
    const rH = 26;
    const rGrad = ctx.createLinearGradient(cx - rW / 2, 0, cx + rW / 2, 0);
    rGrad.addColorStop(0, "#b8860b");
    rGrad.addColorStop(0.5, "#f5c518");
    rGrad.addColorStop(1, "#b8860b");
    ctx.fillStyle = rGrad;
    ctx.beginPath();
    ctx.roundRect(cx - rW / 2, cy + 68, rW, rH, 4);
    ctx.fill();
    ctx.fillStyle = "#3d2800";
    ctx.font = "700 18px Georgia, serif";
    ctx.letterSpacing = "1px";
    ctx.fillText(label.toUpperCase(), cx, cy + 86);
    ctx.letterSpacing = "0px";
  };
  drawBadge(W / 2 - 120, 680, "100% Secure");
  drawBadge(W / 2 + 120, 680, "Deployed");

  // ── Signature block ──
  ctx.fillStyle = "#1a2e4a";
  ctx.font = "italic 62px 'Great Vibes', cursive";
  ctx.fillText("Ayush Rai", W / 2, 870);
  // Underline
  ctx.strokeStyle = "rgba(26,46,74,0.5)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(W / 2 - 120, 882);
  ctx.lineTo(W / 2 + 120, 882);
  ctx.stroke();
  // Founder label
  ctx.fillStyle = "#6b5000";
  ctx.font = "600 20px Georgia, serif";
  ctx.letterSpacing = "4px";
  ctx.fillText("FOUNDER", W / 2, 910);
  ctx.letterSpacing = "0px";

  // ── Watermark footer ──
  ctx.fillStyle = "#b8a070";
  ctx.font = "18px Georgia, serif";
  ctx.letterSpacing = "3px";
  ctx.fillText(
    "STOCKVAULT  •  2026  •  🛡️ 100% SECURE & VERIFIED APPLICATION",
    W / 2,
    1050,
  );
  ctx.letterSpacing = "0px";

  return canvas;
}

export default function CertificatePage() {
  const certRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState("");
  const [mobileImageSrc, setMobileImageSrc] = useState("");
  const [showMobileImage, setShowMobileImage] = useState(false);

  // Inject Google Fonts into <head> once on mount
  useEffect(() => {
    if (!document.querySelector('link[href*="Great+Vibes"]')) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href =
        "https://fonts.googleapis.com/css2?family=Great+Vibes&display=swap";
      document.head.appendChild(link);
    }
  }, []);

  const handleDownload = async () => {
    setDownloading(true);
    setDownloadError("");
    setShowMobileImage(false);
    try {
      const canvas = await drawCertificateToCanvas();
      const dataUrl = canvas.toDataURL("image/png");

      // Try anchor download first
      const a = document.createElement("a");
      a.download = "StockVault-Certificate-AyushRai.png";
      a.href = dataUrl;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      // Also show mobile fallback image in case download didn't trigger
      setMobileImageSrc(dataUrl);
      setShowMobileImage(true);
    } catch (err) {
      console.error("Certificate download failed:", err);
      setDownloadError(
        "Could not generate download. Please try the 'Save Image' button below.",
      );
      // Try to generate image anyway for manual save
      try {
        const canvas = await drawCertificateToCanvas();
        setMobileImageSrc(canvas.toDataURL("image/png"));
        setShowMobileImage(true);
      } catch (_) {
        // ignore
      }
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-start py-10 px-4"
      style={{
        background:
          "linear-gradient(135deg, #0a1628 0%, #1a2e4a 50%, #0d1f3c 100%)",
      }}
    >
      {/* Download buttons */}
      <div className="w-full max-w-3xl flex flex-col items-center gap-3 mb-6">
        <Button
          onClick={handleDownload}
          disabled={downloading}
          data-ocid="certificate.download_button"
          className="font-semibold px-8 py-3 gap-2 text-base"
          style={{
            background: "linear-gradient(135deg, #f5c518 0%, #b8860b 100%)",
            color: "#2d1a00",
            border: "none",
            boxShadow: "0 4px 18px rgba(181,136,11,0.45)",
          }}
        >
          <Download className="w-5 h-5" />
          {downloading ? "Generating..." : "Download as Image"}
        </Button>

        {downloadError && (
          <p
            data-ocid="certificate.error_state"
            className="text-red-400 text-sm text-center"
          >
            {downloadError}
          </p>
        )}

        {/* Mobile long-press save fallback */}
        {showMobileImage && mobileImageSrc && (
          <div className="flex flex-col items-center gap-2 mt-2">
            <p className="text-yellow-300 text-sm text-center font-medium">
              On mobile: long-press the image below and tap "Save Image" to
              download.
            </p>
            <img
              src={mobileImageSrc}
              alt="StockVault Certificate of Achievement -- Ayush Rai"
              data-ocid="certificate.canvas_target"
              style={{
                width: "100%",
                maxWidth: 780,
                borderRadius: 12,
                boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
                cursor: "pointer",
              }}
            />
          </div>
        )}
      </div>

      {/* ─── Certificate card (visual display only) ─── */}
      <div
        ref={certRef}
        style={{
          width: "100%",
          maxWidth: 780,
          background:
            "linear-gradient(160deg, #fdf6e3 0%, #fef9f0 55%, #fdf0d5 100%)",
          borderRadius: 12,
          boxShadow:
            "0 24px 80px rgba(0,0,0,0.55), 0 8px 32px rgba(181,136,11,0.2)",
          padding: "56px 60px",
          position: "relative",
          overflow: "hidden",
          fontFamily: "Georgia, 'Times New Roman', serif",
        }}
      >
        {CORNER_CONFIGS.map(({ pos, corner }) => (
          <CornerOrnament key={corner} pos={pos} corner={corner} />
        ))}
        <div
          style={{
            position: "absolute",
            inset: 14,
            borderRadius: 8,
            border: "2px solid",
            borderColor: "#c9960c",
            opacity: 0.45,
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 20,
            borderRadius: 6,
            border: "1px solid",
            borderColor: "#d4a017",
            opacity: 0.25,
            pointerEvents: "none",
          }}
        />

        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 12,
              marginBottom: 8,
            }}
          >
            <div
              style={{
                height: 1,
                flex: 1,
                background: "linear-gradient(90deg, transparent, #b8860b)",
              }}
            />
            <Award style={{ width: 28, height: 28, color: "#b8860b" }} />
            <div
              style={{
                height: 1,
                flex: 1,
                background: "linear-gradient(90deg, #b8860b, transparent)",
              }}
            />
          </div>
          <p
            style={{
              fontSize: 11,
              letterSpacing: "0.35em",
              textTransform: "uppercase",
              color: "#8a6200",
              fontWeight: 600,
              marginBottom: 6,
            }}
          >
            This Certificate is Proudly Presented to
          </p>
          <h1
            style={{
              fontSize: 38,
              fontWeight: 800,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              color: "#1a2e4a",
              lineHeight: 1.15,
              textShadow: "0 1px 0 rgba(255,255,255,0.8)",
            }}
          >
            Certificate of Achievement
          </h1>
          <div
            style={{
              width: 80,
              height: 3,
              background: "linear-gradient(90deg, #f5c518, #b8860b, #f5c518)",
              borderRadius: 2,
              margin: "12px auto 0",
            }}
          />
        </div>

        <div style={{ textAlign: "center", marginBottom: 6 }}>
          <p
            style={{
              fontFamily: "'Great Vibes', 'Dancing Script', cursive",
              fontSize: 62,
              color: "#1a2e4a",
              lineHeight: 1.2,
              textShadow: "0 2px 8px rgba(26,46,74,0.15)",
              marginBottom: 0,
            }}
          >
            Ayush Rai
          </p>
          <p
            style={{
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "#b8860b",
              marginTop: 4,
            }}
          >
            Lead App Developer &amp; Founder, StockVault
          </p>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            margin: "20px 0",
          }}
        >
          <div
            style={{
              height: 1,
              flex: 1,
              background: "linear-gradient(90deg, transparent, #c9960c60)",
            }}
          />
          <div
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "#b8860b",
            }}
          />
          <div
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "#f5c518",
            }}
          />
          <div
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "#b8860b",
            }}
          />
          <div
            style={{
              height: 1,
              flex: 1,
              background: "linear-gradient(90deg, #c9960c60, transparent)",
            }}
          />
        </div>

        <p
          style={{
            textAlign: "center",
            fontSize: 14,
            lineHeight: 1.75,
            color: "#3d3020",
            maxWidth: 560,
            margin: "0 auto 28px",
            fontStyle: "italic",
          }}
        >
          For the innovative development and successful deployment of
          StockVault, a 100% Secure Inventory Management Application with Voice
          Search and Multilingual support.
        </p>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 40,
            marginBottom: 32,
          }}
        >
          <GoldMedalBadge label="100% Secure" />
          <GoldMedalBadge label="Deployed" />
        </div>

        <div
          style={{ display: "flex", justifyContent: "center", marginTop: 8 }}
        >
          <div style={{ textAlign: "center", minWidth: 180 }}>
            <p
              style={{
                fontFamily: "'Great Vibes', cursive",
                fontSize: 34,
                color: "#1a2e4a",
                lineHeight: 1,
                marginBottom: 4,
              }}
            >
              Ayush Rai
            </p>
            <div
              style={{
                height: 1.5,
                background:
                  "linear-gradient(90deg, transparent, #1a2e4a80, transparent)",
                margin: "0 0 6px",
              }}
            />
            <p
              style={{
                fontSize: 11,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "#6b5000",
                fontWeight: 600,
              }}
            >
              Founder
            </p>
          </div>
        </div>

        <p
          style={{
            textAlign: "center",
            fontSize: 10,
            color: "#b8a070",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            marginTop: 28,
          }}
        >
          StockVault &bull; 2026 &bull; &#128737; 100% Secure &amp; Verified
          Application
        </p>
      </div>
    </div>
  );
}
