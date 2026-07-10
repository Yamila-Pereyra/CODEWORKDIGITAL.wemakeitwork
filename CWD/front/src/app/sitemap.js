import { SITE_URL } from "@/lib/site";

const routes = ["/", "/quienessomos", "/servicios", "/contacto"];

export default function sitemap() {
  return routes.map((route) => ({
    url: new URL(route, SITE_URL).toString(),
    lastModified: new Date(),
  }));
}
