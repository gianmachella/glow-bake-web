import CookieDetailPage from "@/components/CookieDetailPage";
import { use } from "react";

export default function CookiePage({ params }) {
  const resolvedParams = use(params);
  return <CookieDetailPage params={resolvedParams} />;
}
