"use client";

import Link from "next/link";
import { JSX, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Hexagon, MoveRight } from "lucide-react";

// Style imports
import navbarBody from "@/components/scss/navbar-body.module.scss";
import navbarFooter from "@/components/scss/navbar-footer.module.scss";
import insetImg from "@/components/scss/navbar-inset-img.module.scss";
import navbarNav from "@/components/scss/navbar-nav.module.scss";
import navbarRoot from "@/components/scss/navbar-root.module.scss";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";

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
  { title: "Features", href: "/", src: "/rate-img-2.jpg" },
  { title: "How_it_Works", href: "/shop", src: "/rate-img-3.jpg" },
  { title: "Cookbook", href: "/about", src: "/rate-img-4.jpg" },
  { title: "Reviews", href: "/lookbook", src: "/rate-img-5.jpg" },
  { title: "Devs_Portfolio", href: "/contact", src: "/rate-img-1.jpg" },
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
          <Link key={`link_${index}`} href={href}>
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
    { label: "Typography:", value: "Google Fonts" },
    { label: "Images:", value: "Unsplash, Devianart" },
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
          <Link href="/privacy-policy" className="text-purple-500">
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
          <Link href="/terms-of-service" className="text-purple-500">
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
          <div className="flex items-center">
            <Hexagon className="size-4 lg:size-7 shrink-0 mr-2 text-purple-500" />
            <span>Market Maven</span>
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
            >
              Menu
            </motion.p>
            <motion.p
              variants={animations.opacity}
              animate={isActive ? "open" : "closed"}
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
