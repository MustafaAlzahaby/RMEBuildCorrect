const backendOrigin = process.env.BACKEND_ORIGIN;

if (!backendOrigin) {
  throw new Error("Set BACKEND_ORIGIN to the deployed Express service URL in Vercel.");
}

const backend = new URL(backendOrigin);
if (
  backend.protocol !== "https:" ||
  backend.username ||
  backend.password ||
  backend.pathname !== "/" ||
  backend.search ||
  backend.hash
) {
  throw new Error("BACKEND_ORIGIN must be an HTTPS origin with no credentials or path.");
}

export const config = {
  framework: "vite",
  rewrites: [
    { source: "/api/:path*", destination: `${backend.origin}/api/:path*` },
    { source: "/:page(login|register|verify-email|dashboard|admin)", destination: "/index.html" },
    { source: "/library/:path*", destination: "/index.html" },
    { source: "/lessons/:id", destination: "/index.html" },
  ],
};
