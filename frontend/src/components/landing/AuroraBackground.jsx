import { useState } from "react";
import { motion } from "framer-motion";

export default function AuroraBackground() {
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videoError, setVideoError] = useState(false);

  // Real-life fitness training video (athletic gym workout footage)
  const primaryVideoUrl =
    "https://assets.mixkit.co/videos/52089/52089-720.mp4";
  const fallbackVideoUrl =
    "https://assets.mixkit.co/videos/52317/52317-720.mp4";
  const posterUrl =
    "https://assets.mixkit.co/videos/52089/52089-thumb-720-0.jpg";

  return (
    <div className="absolute inset-0 h-full w-full overflow-hidden pointer-events-none select-none z-0">

      {/* Deep Obsidian / Near-Black Base */}
      <div className="absolute inset-0 bg-[#060608]" />

      {/* =========================================================
          AUTHENTIC FITNESS/GYM VIDEO (Edge-to-Edge Full Viewport)
          Natural color, brightened to clearly recognize the athlete
      ========================================================= */}
      {!videoError && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: videoLoaded ? 0.8 : 0.3 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="absolute inset-0 h-full w-full"
        >
          <video
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            poster={posterUrl}
            onLoadedData={() => setVideoLoaded(true)}
            onError={() => setVideoError(true)}
            className="h-full w-full object-cover object-center filter contrast-[1.06] brightness-[0.9] saturate-[0.95]"
          >
            <source src={primaryVideoUrl} type="video/mp4" />
            <source src={fallbackVideoUrl} type="video/mp4" />
          </video>
        </motion.div>
      )}

      {/* Fallback Image Poster if video cannot play */}
      {videoError && (
        <div
          className="absolute inset-0 h-full w-full bg-cover bg-center opacity-40 filter contrast-[1.05] brightness-[0.85]"
          style={{ backgroundImage: `url(${posterUrl})` }}
        />
      )}

      {/* =========================================================
          SOPHISTICATED OBSIDIAN GRADIENT & VIGNETTE OVERLAYS
          Lighter center so gym and athlete remain clearly visible
      ========================================================= */}
      {/* 1. Natural Center Vignette (gentle in middle, framed on margins) */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(6,6,8,0.18)_0%,rgba(6,6,8,0.45)_52%,#060608_100%)]" />

      {/* 2. Top-down scrim for seamless transparent navbar */}
      <div className="absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-[#060608]/75 via-[#060608]/25 to-transparent" />

      {/* 3. Bottom-up scrim for seamless transition into next section */}
      <div className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-[#060608] via-[#060608]/80 to-transparent" />

    </div>
  );
}



