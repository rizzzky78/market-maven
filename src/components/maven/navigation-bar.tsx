"use client";

import Link from "next/link";
import { JSX, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

// Style imports
import navbarBody from "@/components/scss/navbar-body.module.scss";
import navbarFooter from "@/components/scss/navbar-footer.module.scss";
import insetImg from "@/components/scss/navbar-inset-img.module.scss";
import navbarNav from "@/components/scss/navbar-nav.module.scss";
import navbarRoot from "@/components/scss/navbar-root.module.scss";

// Animation configurations
const transition = { duration: 1, ease: [0.76, 0, 0.24, 1] };

const animations = {
  opacity: {
    initial: { opacity: 0 },
    open: { opacity: 1, transition: { duration: 0.35 } },
    closed: { opacity: 0, transition: { duration: 0.35 } },
  },

  height: {
    initial: { height: 0 },
    enter: { height: "auto", transition },
    exit: { height: 0, transition },
  },

  background: {
    initial: { height: 0 },
    open: { height: "100vh", transition },
    closed: { height: 0, transition },
  },

  blur: {
    initial: { filter: "blur(0px)", opacity: 1 },
    open: { filter: "blur(4px)", opacity: 0.6, transition: { duration: 0.3 } },
    closed: { filter: "blur(0px)", opacity: 1, transition: { duration: 0.3 } },
  },

  translate: {
    initial: { y: "100%", opacity: 0 },
    enter: (i: any[]) => ({
      y: 0,
      opacity: 1,
      transition: { duration: 1, ease: [0.76, 0, 0.24, 1], delay: i[0] },
    }),
    exit: (i: any[]) => ({
      y: "100%",
      opacity: 0,
      transition: { duration: 0.7, ease: [0.76, 0, 0.24, 1], delay: i[1] },
    }),
  },
};

// Navigation links data
const navigationLinks = [
  { title: "Features", href: "/features", src: "/showcase/nav-assets-1.jpeg" },
  {
    title: "How_its_Works",
    href: "/workflow",
    src: "/showcase/nav-assets-2.jpeg",
  },
  { title: "Cookbook", href: "/cookbook", src: "/showcase/nav-assets-3.jpeg" },
  { title: "Reviews", href: "/reviews", src: "/showcase/nav-assets-4.jpeg" },
  {
    title: "Dev_Portfolio",
    href: "https://rzkyprasetyo.vercel.app",
    src: "/showcase/nav-assets-5.jpeg",
  },
];

// Character animation helper
const animateChars = (word: string) => {
  const chars: JSX.Element[] = [];
  word.split("").forEach((char, i) => {
    chars.push(
      <motion.span
        custom={[i * 0.02, (word.length - i) * 0.01]}
        variants={animations.translate}
        initial="initial"
        animate="enter"
        exit="exit"
        key={`${char}-${i}`}
      >
        {char}
      </motion.span>
    );
  });
  return chars;
};

// Component for displaying the navigation menu
function NavigationMenu() {
  const [selectedLink, setSelectedLink] = useState({
    isActive: false,
    index: 0,
  });

  return (
    <motion.div
      variants={animations.height}
      initial="initial"
      animate="enter"
      exit="exit"
      className={navbarNav.nav}
    >
      <div className={navbarNav.wrapper}>
        <div className={navbarNav.container}>
          <NavigationBody
            links={navigationLinks}
            selectedLink={selectedLink}
            setSelectedLink={setSelectedLink}
          />
          <NavigationFooter />
        </div>
        <NavigationImage
          src={navigationLinks[selectedLink.index].src}
          isActive={selectedLink.isActive}
        />
      </div>
    </motion.div>
  );
}

// Props interface for navigation body
interface NavigationBodyProps {
  links: { title: string; href: string }[];
  selectedLink: { isActive: boolean; index: number };
  setSelectedLink: (arg: { isActive: boolean; index: number }) => void;
}

// Component for navigation menu links
function NavigationBody({
  links,
  selectedLink,
  setSelectedLink,
}: NavigationBodyProps) {
  return (
    <div className={navbarBody.body}>
      {links.map((link, index) => {
        const { title, href } = link;
        return (
          <Link
            key={`link_${index}`}
            href={href}
            target={title === "Devs_Portfolio" ? "_blank" : undefined}
            rel={title === "Devs_Portfolio" ? "noopener noreferrer" : undefined}
            className="font-[family-name:var(--font-array)] hover:text-purple-500 transition-colors duration-500"
          >
            <motion.p
              onMouseOver={() => setSelectedLink({ isActive: true, index })}
              onMouseLeave={() => setSelectedLink({ isActive: false, index })}
              variants={animations.blur}
              animate={
                selectedLink.isActive && selectedLink.index !== index
                  ? "open"
                  : "closed"
              }
            >
              {animateChars(title)}
            </motion.p>
          </Link>
        );
      })}
    </div>
  );
}

// Props interface for navigation image
interface NavigationImageProps {
  src: string;
  isActive: boolean;
}

// Component for the hover image display
function NavigationImage({ src, isActive }: NavigationImageProps) {
  return (
    <motion.div
      variants={animations.opacity}
      initial="initial"
      animate={isActive ? "open" : "closed"}
      className={insetImg.imageContainer}
    >
      <Image src={src} fill={true} alt="navigation image" />
    </motion.div>
  );
}

// Component for the navigation footer
function NavigationFooter() {
  const footerLinks = [
    { label: "Made by:", value: "Rzky" },
    { label: "Typography:", value: "Array, Khand, Satoshi" },
    { label: "Images:", value: "Lummi AI" },
  ];

  return (
    <div className={navbarFooter.footer}>
      {footerLinks.map((item, index) => (
        <ul key={`footer_${index}`}>
          <motion.li
            custom={[0.3, 0]}
            variants={animations.translate}
            initial="initial"
            animate="enter"
            exit="exit"
            className="font-[family-name:var(--font-khand)] text-lg"
          >
            <span>{item.label}</span>
            {item.value}
          </motion.li>
        </ul>
      ))}
      <ul>
        <motion.li
          custom={[0.3, 0]}
          variants={animations.translate}
          initial="initial"
          animate="enter"
          exit="exit"
        >
          <Link
            href="/login"
            className="text-purple-500 text-lg font-[family-name:var(--font-khand)]"
          >
            Go to Login
          </Link>
        </motion.li>
        <motion.li
          custom={[0.3, 0]}
          variants={animations.translate}
          initial="initial"
          animate="enter"
          exit="exit"
        >
          <Link
            href="/privacy-policy"
            className="text-purple-500 text-lg font-[family-name:var(--font-khand)]"
          >
            Privacy Policy
          </Link>
        </motion.li>
        <motion.li
          custom={[0.3, 0]}
          variants={animations.translate}
          initial="initial"
          animate="enter"
          exit="exit"
        >
          <Link
            href="/terms-of-service"
            className="text-purple-500 text-lg font-[family-name:var(--font-khand)]"
          >
            Terms & Conditions
          </Link>
        </motion.li>
      </ul>
    </div>
  );
}

// Main component export
export function NavigationBar() {
  const [isActive, setIsActive] = useState(false);

  return (
    <div className={navbarRoot.header}>
      <div className={navbarRoot.bar}>
        <Link href="/">
          <div className="flex items-center space-x-2">
            <div className="flex aspect-square size-6 items-center justify-center">
              <svg
                className="coolshapes polygon-7 "
                height="100"
                width="100"
                fill="none"
                viewBox="0 0 200 200"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g clipPath="url(#cs_clip_1_polygon-7)">
                  <mask
                    height="200"
                    id="cs_mask_1_polygon-7"
                    style={{ maskType: "alpha" }}
                    width="182"
                    x="9"
                    y="0"
                    maskUnits="userSpaceOnUse"
                  >
                    <path
                      d="M86.449 3.601a27.296 27.296 0 0127.102 0l63.805 36.514C185.796 44.945 191 53.9 191 63.594v72.812c0 9.694-5.204 18.649-13.644 23.479l-63.805 36.514a27.3 27.3 0 01-27.102 0l-63.805-36.514C14.204 155.055 9 146.1 9 136.406V63.594c0-9.694 5.204-18.649 13.644-23.48L86.45 3.602z"
                      fill="#fff"
                    />
                  </mask>
                  <g mask="url(#cs_mask_1_polygon-7)">
                    <path d="M200 0H0v200h200V0z" fill="#fff" />
                    <path d="M200 0H0v200h200V0z" fill="#0E6FFF" />
                    <g filter="url(#filter0_f_748_4355)">
                      <path d="M209 126H-9v108h218V126z" fill="#8F5BFF" />
                      <ellipse
                        cx="87"
                        cy="57.5"
                        fill="#00F0FF"
                        rx="59"
                        ry="34.5"
                      />
                    </g>
                  </g>
                </g>
                <g
                  style={{ mixBlendMode: "overlay" }}
                  mask="url(#cs_mask_1_polygon-7)"
                >
                  <path
                    d="M200 0H0v200h200V0z"
                    fill="gray"
                    stroke="transparent"
                    filter="url(#cs_noise_1_polygon-7)"
                  />
                </g>
                <defs>
                  <filter
                    height="331"
                    id="filter0_f_748_4355"
                    width="338"
                    x="-69"
                    y="-37"
                    filterUnits="userSpaceOnUse"
                    colorInterpolationFilters="sRGB"
                  >
                    <feFlood result="BackgroundImageFix" floodOpacity="0" />
                    <feBlend
                      result="shape"
                      in="SourceGraphic"
                      in2="BackgroundImageFix"
                    />
                    <feGaussianBlur
                      result="effect1_foregroundBlur_748_4355"
                      stdDeviation="30"
                    />
                  </filter>
                  <clipPath id="cs_clip_1_polygon-7">
                    <path d="M0 0H200V200H0z" fill="#fff" />
                  </clipPath>
                </defs>
                <defs>
                  <filter
                    height="100%"
                    id="cs_noise_1_polygon-7"
                    width="100%"
                    x="0%"
                    y="0%"
                    filterUnits="objectBoundingBox"
                  >
                    <feBlend result="out3" in="SourceGraphic" in2="out2" />
                  </filter>
                </defs>
              </svg>
            </div>
            <p className="font-[family-name:var(--font-array)] text-xl font-semibold tracking-wider">
              MAVEN <span className="text-purple-500">AI</span>
            </p>
          </div>
        </Link>
        <div onClick={() => setIsActive(!isActive)} className={navbarRoot.el}>
          <div
            className={`${navbarRoot.burger} ${
              isActive ? navbarRoot.burgerActive : ""
            } dark:text-white`}
          ></div>
          <div className={navbarRoot.label}>
            <motion.p
              variants={animations.opacity}
              animate={!isActive ? "open" : "closed"}
              className="text-lg font-[family-name:var(--font-array)]"
            >
              Menu
            </motion.p>
            <motion.p
              variants={animations.opacity}
              animate={isActive ? "open" : "closed"}
              className="text-lg font-[family-name:var(--font-array)]"
            >
              Close
            </motion.p>
          </div>
        </div>
      </div>
      <motion.div
        variants={animations.background}
        initial="initial"
        animate={isActive ? "open" : "closed"}
        className={navbarRoot.background}
      ></motion.div>
      <AnimatePresence mode="wait">
        {isActive && <NavigationMenu />}
      </AnimatePresence>
    </div>
  );
}
