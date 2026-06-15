import { defineLive } from "next-sanity/live";
import { client } from "./client";

export const { sanityFetch, SanityLive } = defineLive({
  client: client.withConfig({
    // Live content is available only on production and development environments
    // without static generation, or with revalidation set to 0.
    apiVersion: "2025-04-23",
  }),
  serverToken: process.env.SANITY_API_READ_TOKEN,
  browserToken: process.env.NEXT_PUBLIC_SANITY_API_TOKEN,
});
