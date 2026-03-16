interface SplashScreenProps {
  fading: boolean;
}

export default function SplashScreen({ fading }: SplashScreenProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-sky-100"
      style={{
        opacity: fading ? 0 : 1,
        transition: "opacity 0.6s ease-in-out",
        pointerEvents: fading ? "none" : "all",
      }}
      data-ocid="splash.panel"
    >
      <img
        src="/assets/generated/stockvault-logo-transparent.dim_400x100.png"
        alt="StockVault"
        className="w-72 object-contain"
      />
    </div>
  );
}
