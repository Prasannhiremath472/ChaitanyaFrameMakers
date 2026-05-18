export const fadeUp = {
  hidden:  { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

export const fadeIn = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5 } },
};

export const slideInLeft = {
  hidden:  { opacity: 0, x: -60 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

export const slideInRight = {
  hidden:  { opacity: 0, x: 60 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

export const scaleIn = {
  hidden:  { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

export const staggerContainer = (staggerChildren = 0.1, delayChildren = 0) => ({
  hidden:  {},
  visible: { transition: { staggerChildren, delayChildren } },
});

export const cardHover = {
  rest:  { scale: 1, y: 0 },
  hover: { scale: 1.03, y: -8, transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] } },
};

export const buttonTap = { scale: 0.96 };

export const pageTransition = {
  initial:  { opacity: 0, y: 20 },
  animate:  { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
  exit:     { opacity: 0, y: -20, transition: { duration: 0.3 } },
};

export const navVariants = {
  top:      { backgroundColor: 'rgba(0,0,0,0)', backdropFilter: 'blur(0px)' },
  scrolled: { backgroundColor: 'rgba(10,10,10,0.95)', backdropFilter: 'blur(20px)' },
};
