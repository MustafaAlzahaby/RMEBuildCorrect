function getBackendOrigin() {
  const configuredOrigin = process.env.BACKEND_ORIGIN?.trim();
  if (!configuredOrigin) {
    throw new Error("Set BACKEND_ORIGIN in the frontend Vercel deployment environment.");
  }

  const backend = URL.canParse(configuredOrigin) ? new URL(configuredOrigin) : null;
  if (
    !backend ||
    backend.protocol !== "https:" ||
    backend.username ||
    backend.password ||
    backend.pathname !== "/" ||
    backend.search ||
    backend.hash
  ) {
    throw new Error("BACKEND_ORIGIN must be an HTTPS origin without credentials, a path, or a query.");
  }

  return backend.origin;
}

export const config = {
  framework: "vite",
  rewrites: [
    { source: "/api/:path*", destination: `${getBackendOrigin()}/api/:path*` },
    { source: "/:page(login|register|verify-email|dashboard|admin)", destination: "/index.html" },
    { source: "/library/:path*", destination: "/index.html" },
    { source: "/lessons/:id", destination: "/index.html" },
  ],
};
