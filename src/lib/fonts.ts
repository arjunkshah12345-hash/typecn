import { Anybody, Bricolage_Grotesque, Fraunces, Geist, Geist_Mono, JetBrains_Mono } from "next/font/google";

/* Site chrome */
export const geist = Geist({ subsets: ["latin"], variable: "--font-geist", display: "swap" });
export const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono", display: "swap" });

/* Effect specimens (variable fonts the playground exposes) */
export const fraunces = Fraunces({ subsets: ["latin"], axes: ["SOFT", "WONK", "opsz"], variable: "--font-fraunces", display: "swap" });
export const bricolage = Bricolage_Grotesque({ subsets: ["latin"], axes: ["wdth", "opsz"], variable: "--font-bricolage", display: "swap" });
export const anybody = Anybody({ subsets: ["latin"], axes: ["wdth"], variable: "--font-anybody", display: "swap" });
export const jetbrains = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains", display: "swap" });

export const fontVariables = [geist.variable, geistMono.variable, fraunces.variable, bricolage.variable, anybody.variable, jetbrains.variable].join(" ");
