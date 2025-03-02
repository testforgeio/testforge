import type { Site, SocialObjects } from "./types";

export const SITE: Site = {
  website: "https://testforge.blog/",
  author: "testforge",
  profile: "https://github.com/testforgeio",
  desc: "Your ultimate resource for insights and innovations in TestOps, MLOps, and DevOps.",
  title: "testforge",
  ogImage: "image-social-default.jpg",
  lightAndDarkMode: true,
  postPerIndex: 3,
  postPerPage: 5,
  scheduledPostMargin: 15 * 60 * 1000, // 15 minutes
  editPost: {
    url: "https://github.com/testforgeio/testforge/edit/main/blog/src/content/blog",
    text: "Suggest Changes",
    appendFilePath: false,
  },
};

export const LOCALE = {
  lang: "en", // html lang code. Set this empty and default will be "en"
  langTag: ["en-EN"], // BCP 47 Language Tags. Set this empty [] to use the environment default
} as const;

export const SOCIALS: SocialObjects = [
  {
    name: "Github",
    href: "https://github.com/testforgeio/testforge",
    linkTitle: ` ${SITE.title} on Github`,
    active: true,
  },
  {
    name: "X",
    href: "https://x.com/testforgeio",
    linkTitle: `${SITE.title} on X`,
    active: true,
  },
  {
    name: "TikTok",
    href: "https://www.tiktok.com/@testforge",
    linkTitle: `${SITE.title} on TikTok`,
    active: true,
  },
  {
    name: "Twitch",
    href: "https://github.com/testforgeio/testforge",
    linkTitle: `${SITE.title} on Twitch`,
    active: false,
  },
  {
    name: "YouTube",
    href: "https://github.com/testforgeio/testforge",
    linkTitle: `${SITE.title} on YouTube`,
    active: false,
  },
  {
    name: "Telegram",
    href: "https://github.com/testforgeio/testforge",
    linkTitle: `${SITE.title} on Telegram`,
    active: false,
  },
  {
    name: "Instagram",
    href: "https://github.com/testforgeio/testforge",
    linkTitle: `${SITE.title} on Instagram`,
    active: false,
  },
  {
    name: "LinkedIn",
    href: "https://github.com/testforgeio/testforge",
    linkTitle: `${SITE.title} on LinkedIn`,
    active: false,
  },
  {
    name: "Mail",
    href: "mailto:testforge.io@gmail.com",
    linkTitle: `Send an email to ${SITE.title}`,
    active: false,
  }
];
