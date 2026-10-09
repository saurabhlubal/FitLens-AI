import { motion } from "framer-motion";

const joints = [
  [110, 45],
  [110, 85],
  [80, 115],
  [140, 115],
  [65, 180],
  [155, 180],
  [55, 250],
  [165, 250],
  [110, 185],
  [90, 285],
  [130, 285],
  [80, 375],
  [140, 375],
];

const connections = [
  [0, 1],
  [1, 2], [1, 3],
  [2, 4], [4, 6],
  [3, 5], [5, 7],
  [1, 8],
  [8, 9], [8, 10],
  [9, 11], [10, 12],
];

export default function PoseSkeleton() {
  return (
    <motion.div
      animate={{
        y: [-4, 4, -4],
      }}
      transition={{
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      className="relative flex items-center justify-center"
    >
      {/* Ambient Depth Glow */}
      <div className="absolute inset-0 rounded-full bg-[#B8F23A]/[0.06] blur-3xl pointer-events-none" />

      <svg
        width="240"
        height="400"
        viewBox="0 0 220 420"
        className="relative z-10"
      >
        <defs>
          <filter id="limeGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Anatomical Body Silhouette */}
        <motion.path
          d="M110 40
             C88 40 74 58 74 88
             L74 145
             C74 175 84 195 96 215
             L96 250
             L88 370
             L102 370
             L110 265
             L118 370
             L132 370
             L124 250
             L124 215
             C136 195 146 175 146 145
             L146 88
             C146 58 132 40 110 40Z"
          fill="rgba(255,255,255,0.02)"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="1.5"
        />

        {/* Bone Connections */}
        {connections.map(([a, b], i) => (
          <motion.line
            key={i}
            x1={joints[a][0]}
            y1={joints[a][1]}
            x2={joints[b][0]}
            y2={joints[b][1]}
            stroke="#B8F23A"
            strokeWidth="2.2"
            strokeLinecap="round"
            filter="url(#limeGlow)"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.85 }}
            transition={{
              duration: 0.8,
              delay: i * 0.04,
              ease: "easeOut",
            }}
          />
        ))}

        {/* Biomechanical Joints */}
        {joints.map(([x, y], i) => (
          <g key={i}>
            {/* Outer Joint Aura */}
            <motion.circle
              cx={x}
              cy={y}
              r="6"
              fill="#B8F23A"
              fillOpacity="0.25"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.25, 0.6, 0.25],
              }}
              transition={{
                duration: 2.2,
                repeat: Infinity,
                delay: i * 0.07,
                ease: "easeInOut",
              }}
            />
            {/* Inner Core Node */}
            <circle
              cx={x}
              cy={y}
              r="3.5"
              fill="#FFFFFF"
              stroke="#B8F23A"
              strokeWidth="1.2"
            />
          </g>
        ))}

        {/* Outer Rotating Cyber Telemetry Ring (Subtle Neutral) */}
        <motion.circle
          cx="110"
          cy="185"
          r="92"
          fill="none"
          stroke="rgba(245,245,240,0.2)"
          strokeWidth="1"
          strokeDasharray="8 12"
          animate={{
            rotate: 360,
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "linear",
          }}
          style={{
            transformOrigin: "110px 185px",
          }}
        />

        {/* Inner Counter-Rotating Telemetry Ring (Electric Lime) */}
        <motion.circle
          cx="110"
          cy="185"
          r="64"
          fill="none"
          stroke="#B8F23A"
          strokeWidth="1"
          strokeOpacity="0.4"
          strokeDasharray="4 8"
          animate={{
            rotate: -360,
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "linear",
          }}
          style={{
            transformOrigin: "110px 185px",
          }}
        />
      </svg>
    </motion.div>
  );
}

