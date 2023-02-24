import * as React from "react";
import type { LinksFunction, LoaderArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  Form,
  Link,
  Outlet,
  useLoaderData,
  useLocation,
  useNavigation,
} from "@remix-run/react";
import { cssBundleHref } from "@remix-run/css-bundle";
import * as Fathom from "fathom-client";
import clsx from "clsx";
import appStylesHref from "tailwindcss/tailwind.css";

import { useMatches } from "./lib/use-matches";
import { getUser } from "./session.server";
import interStylesHref from "./styles/inter.css";
import { Svg } from "./components/heroicons";
import { getSeo } from "./seo";
import { Document } from "./components/document";
import { env } from "./env";

export { CatchBoundary } from "./components/root-catch-boundary";
export { ErrorBoundary } from "./components/root-error-boundary";

let [seoMeta, seoLinks] = getSeo();

export let meta: MetaFunction = () => ({
  ...seoMeta,
  "apple-mobile-web-app-title": "Sneakers",
  "application-name": "Sneakers",
  "msapplication-TileColor": "#000000",
  "apple-mobile-web-app-capable": "yes",
  "apple-mobile-web-app-status-bar-style": "black-translucent",
  viewport: "width=device-width, initial-scale=1, viewport-fit=cover",
});

export let links: LinksFunction = () => {
  let result = [
    ...seoLinks,
    { rel: "preload", href: appStylesHref, as: "style" },
    { rel: "preload", href: interStylesHref, as: "style" },
    { rel: "stylesheet", href: appStylesHref },
    { rel: "stylesheet", href: interStylesHref },
    {
      rel: "icon",
      href: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Ctext x='0' y='14'%3E👟%3C/text%3E%3C/svg%3E",
    },
    {
      rel: "apple-touch-icon",
      sizes: "180x180",
      href: "/apple-touch-icon.png",
    },
    {
      rel: "alternate icon",
      type: "image/png",
      sizes: "32x32",
      href: "/favicon-32x32.png",
    },
    {
      rel: "alternate icon",
      type: "image/png",
      sizes: "16x16",
      href: "/favicon-16x16.png",
    },
    { rel: "manifest", href: "/manifest.webmanifest" },
    { rel: "mask-icon", href: "/safari-pinned-tab.svg", color: "#000000" },
  ];

  if (cssBundleHref) {
    result.push({ rel: "preload", href: cssBundleHref, as: "style" });
    result.push({ rel: "stylesheet", href: cssBundleHref });
  }

  return result;
};

export async function loader({ request }: LoaderArgs) {
  let user = await getUser(request);
  return json({
    user,
    ENV: {
      FATHOM_SITE_ID: env.FATHOM_SITE_ID,
      FATHOM_SCRIPT_URL: env.FATHOM_SCRIPT_URL,
    },
  });
}

export default function App() {
  let data = useLoaderData<typeof loader>();
  let navigation = useNavigation();
  let location = useLocation();
  let [showPendingSpinner, setShowPendingSpinner] = React.useState(false);

  let matches = useMatches();
  let handleBodyClassName = matches.map((match) => match.handle?.bodyClassName);

  React.useEffect(() => {
    Fathom.load(data.ENV.FATHOM_SITE_ID, {
      excludedDomains: ["localhost"],
      url: data.ENV.FATHOM_SCRIPT_URL,
    });
  }, [data.ENV]);

  React.useEffect(() => {
    let timer = setTimeout(() => {
      setShowPendingSpinner(
        navigation.state !== "idle" &&
          navigation.formMethod !== "post" &&
          location.pathname !== "/profile"
      );
    }, 500);

    return () => {
      clearTimeout(timer);
    };
  }, [location.pathname, navigation.formMethod, navigation.state]);

  return (
    <Document
      bodyClassName={clsx(
        showPendingSpinner ? "opacity-60 cursor-not-allowed" : "",
        handleBodyClassName
      )}
    >
      {showPendingSpinner && (
        <div className="fixed z-10 -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2 transform-gpu">
          <Svg
            className="z-10 w-10 h-10 fill-blue-600 animate-spin"
            name="24:solid:refresh-clockwise"
          />
        </div>
      )}

      <nav className="flex items-center justify-end px-4 py-2 sm:px-6 lg:px-8">
        {["/login", "/join", "/logout"].includes(
          location.pathname
        ) ? null : data.user ? (
          <div className="flex items-center space-x-4">
            <Link
              to="/sneakers/add"
              className="rounded-md border border-transparent px-5 py-3 bg-rose-500 text-base font-medium text-white shadow hover:bg-rose-600 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 sm:px-10 text-center"
            >
              Add Sneaker
            </Link>
            <Form reloadDocument method="post" action="/logout">
              <button
                type="submit"
                className="rounded-md border border-transparent px-5 py-3 bg-indigo-500 text-base font-medium text-white shadow hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:px-10 text-center"
              >
                Logout
              </button>
            </Form>
          </div>
        ) : (
          <div className="space-x-4 mt-5">
            <Link
              to="/login"
              className="rounded-md border border-transparent px-5 py-3 bg-rose-500 text-base font-medium text-white shadow hover:bg-rose-600 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 sm:px-10 text-center"
            >
              Login
            </Link>
            <Link
              to="/join"
              className="rounded-md border border-transparent px-5 py-3 bg-indigo-500 text-base font-medium text-white shadow hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:px-10 text-center"
            >
              Join
            </Link>
          </div>
        )}
      </nav>

      <Outlet />
    </Document>
  );
}
