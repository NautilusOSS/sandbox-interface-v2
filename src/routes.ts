import * as Page from "./pages";
export const routes = [
  {
    path: "/",
    Component: Page.Tokens,
  },
  {
    path: "/channels",
    Component: Page.Channels,
  },
  {
    path: "/token",
    Component: Page.Tokens,
  },
  {
    path: "/token/:id",
    Component: Page.Token,
  },
  /*
  {
    path: "/collection",
    Component: Page.Collections,
  },
  {
    path: "/collection/:id",
    Component: Page.Collection,
  },
  {
    path: "/collection/:id/token/:tid",
    Component: Page.Token,
  },
  {
    path: "/account/:id",
    Component: Page.Account,
  },
  {
    path: "/activity",
    Component: Page.Activity,
  },
  {
    path: "/listing",
    Component: Page.Listings,
  },
  */
  {
    path: "/sandbox",
    Component: Page.Sandbox,
  },
  /*
   */
];
