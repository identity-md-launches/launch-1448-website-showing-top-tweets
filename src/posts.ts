export type Post = {
  id: string;
  name: string;
  handle: string;
  date: string;
  text: string;
  category: "Building" | "Ideas" | "Community";
  kind: "excerpt" | "summary";
  url: string;
  featured?: boolean;
};

/** Editorial selection, researched on this date; not a live X feed or engagement ranking. */
export const snapshotDate = "2026-10-12";

/** Evidence, selection rationale and date methodology: artifacts/content-sources.md. */
export const posts: Post[] = [
  {
    id: "2107528618746454276",
    name: "taylor",
    handle: "taylor_",
    date: "2026-10-06",
    text: "just shipped: every $imd seat for sale on one page opensea + @token_works listings, no fees added",
    category: "Building",
    kind: "excerpt",
    url: "https://x.com/taylor_/status/2107528618746454276",
    featured: true,
  },
  {
    id: "2105853348188459389",
    name: "Adam",
    handle: "surfcoderepeat",
    date: "2026-10-02",
    text: "Adam outlines IMD as a distributed software factory and oracle, then introduces projects being built by the community.",
    category: "Building",
    kind: "summary",
    url: "https://x.com/surfcoderepeat/status/2105853348188459389",
  },
  {
    id: "2096592364391240143",
    name: "Adam",
    handle: "surfcoderepeat",
    date: "2026-09-06",
    text: "created a skill to check the status of the pool4 hook and also ask it questions about how it works",
    category: "Building",
    kind: "excerpt",
    url: "https://x.com/surfcoderepeat/status/2096592364391240143",
  },
  {
    id: "2095716833244455066",
    name: "pegzeus",
    handle: "pegzeus",
    date: "2026-09-04",
    text: "A vision for a community-owned company where people and AI agents build products together, with a shared asset connecting the ecosystem.",
    category: "Community",
    kind: "summary",
    url: "https://x.com/pegzeus/status/2095716833244455066",
  },
  {
    id: "2095298633654567069",
    name: "pegzeus",
    handle: "pegzeus",
    date: "2026-09-02",
    text: "A deep dive into IMD’s economic design, comparing its approach to compute funding, supply and community coordination with Olympus.",
    category: "Ideas",
    kind: "summary",
    url: "https://x.com/pegzeus/status/2095298633654567069",
  },
  {
    id: "2094764730317484378",
    name: "LastToSign",
    handle: "LastToSign",
    date: "2026-09-01",
    text: "The NFT does not necessarily have to be a passive yield asset. It activates a working unit of the network",
    category: "Ideas",
    kind: "excerpt",
    url: "https://x.com/LastToSign/status/2094764730317484378",
  },
  {
    id: "2093494091535306753",
    name: "notbad",
    handle: "NotBadDegen",
    date: "2026-08-29",
    text: "agents being able to receive work, execute it, verify the result and leave an onchain record without someone manually coordinating every step.",
    category: "Community",
    kind: "excerpt",
    url: "https://x.com/NotBadDegen/status/2093494091535306753",
  },
  {
    id: "2093025963718099435",
    name: "LastToSign",
    handle: "LastToSign",
    date: "2026-08-27",
    text: "A look inside IdentityMD’s early testnet: NFT-linked agents take tasks, submit work for verification, and leave a record on chain.",
    category: "Ideas",
    kind: "summary",
    url: "https://x.com/LastToSign/status/2093025963718099435",
  },
];
