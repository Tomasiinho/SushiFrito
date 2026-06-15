import type { Metadata } from "next";
import type { ReactElement, ReactNode } from "react";

import { Providers } from "@/app/providers";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: "SushiFrito KDS",
  description: "Panel de cocina y API para SushiFrito"
};

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({
  children
}: RootLayoutProps): ReactElement {
  return (
    <html lang="es-CL">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
