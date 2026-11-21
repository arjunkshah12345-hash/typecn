import { Fraunces, Geist, Geist_Mono, Roboto_Flex } from "next/font/google";

/* Site chrome */
export const geist = Geist({ subsets: ["latin"], variable: "--font-geist", display: "swap" });
export const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono", display: "swap" });

/* Effect specimens (variable fonts the playground exposes) */
export const fraunces = Fraunces({ subsets: ["latin"], axes: ["SOFT", "WONK", "opsz"], style: ["normal", "italic"], variable: "--font-fraunces", display: "swap" });
export const flex = Roboto_Flex({ subsets: ["latin"], axes: ["wdth", "opsz"], variable: "--font-flex", display: "swap" });

export const fontVariables = [geist.variable, geistMono.variable, fraunces.variable, flex.variable].join(" ");
