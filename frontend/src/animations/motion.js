export const fadeUp = {
  hidden: {
    opacity: 0,
    y: 40,
  },

  show: {
    opacity: 1,
    y: 0,

    transition: {
      duration: 0.7,
    },
  },
};

export const stagger = {
  hidden: {},

  show: {
    transition: {
      staggerChildren: 0.2,
    },
  },
};

export const floating = {
  animate: {
    y: [-10, 10, -10],

    transition: {
      duration: 5,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};