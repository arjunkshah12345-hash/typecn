export const site = {
  name: "typecn",
  tagline: "Typography that moves.",
  description: "50 beautiful, open-source text animations for React. Scramble effects, variable-font morphs, magnetic letters, scroll reveals, liquid text and more — customizable, accessible, ready to ship.",
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, ""),
  repo: process.env.NEXT_PUBLIC_REPO_URL ?? "https://github.com/arjunkshah12345-hash/typecn",
  version: "0.1.0",
};
