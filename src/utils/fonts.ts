import { Bebas_Neue as FontBebasNeue, Poppins as FontPoppins, Saira as FontSaira } from "next/font/google";

export const Poppins = FontPoppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
});

export const Saira = FontSaira({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-saira",
});

export const BebasNeue = FontBebasNeue({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-bebas-neue",
});
