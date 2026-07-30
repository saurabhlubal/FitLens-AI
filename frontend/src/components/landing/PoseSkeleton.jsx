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
  [0,1],
  [1,2],[1,3],
  [2,4],[4,6],
  [3,5],[5,7],
  [1,8],
  [8,9],[8,10],
  [9,11],[10,12]
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
      className="relative"
    >
      {/* Glow */}
      <div className="absolute inset-0 rounded-full bg-emerald-500/20 blur-3xl" />

      <svg
        width="250"
        height="420"
        viewBox="0 0 220 420"
        className="relative z-10"
      >
        {/* Body silhouette */}

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
          fill="rgba(255,255,255,.04)"
          stroke="rgba(255,255,255,.08)"
          strokeWidth="2"
        />

        {/* Bones */}

        {connections.map(([a, b], i) => (
          <motion.line
            key={i}
            x1={joints[a][0]}
            y1={joints[a][1]}
            x2={joints[b][0]}
            y2={joints[b][1]}
            stroke="#10B981"
            strokeWidth="2"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{
              duration: 1,
              delay: i * 0.05,
            }}
          />
        ))}

        {/* Joints */}

        {joints.map(([x, y], i) => (
          <motion.circle
            key={i}
            cx={x}
            cy={y}
            r="5"
            fill="#34D399"
            animate={{
              scale: [1, 1.7, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.08,
            }}
          />
        ))}

        {/* AI Rings */}

        <motion.circle
          cx="110"
          cy="185"
          r="95"
          fill="none"
          stroke="#22D3EE"
          strokeWidth="1.5"
          strokeDasharray="10 10"
          animate={{
            rotate: 360,
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "linear",
          }}
          style={{
            transformOrigin: "110px 185px",
          }}
        />

        <motion.circle
          cx="110"
          cy="185"
          r="65"
          fill="none"
          stroke="#10B981"
          strokeWidth="1"
          strokeDasharray="5 8"
          animate={{
            rotate: -360,
          }}
          transition={{
            duration: 7,
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