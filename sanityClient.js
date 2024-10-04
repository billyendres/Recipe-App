// sanityClient.js
import { createClient } from "@sanity/client";

const sanityClient = createClient({
  projectId: "nkubj7ng", // Replace with your Sanity project ID
  dataset: "production", // Replace with your dataset name
  apiVersion: "v2022-03-07", // Use the latest API version or specify one
  useCdn: false, // Set to `true` for faster read-only queries, `false` if you need the latest data
});

export default sanityClient;
