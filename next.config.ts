import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Todo el dashboard depende de datos del momento (tu base, tus números de
  // WhatsApp), así que no usamos el caché de componentes: cada pantalla se
  // arma en cada visita.
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
