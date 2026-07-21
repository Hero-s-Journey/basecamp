import type { RouteObject } from "react-router-dom";
import NotFound from "../pages/NotFound";
import Home from "../pages/home/page";
import ClubPage from "../pages/clubs/ClubPage";

const routes: RouteObject[] = [
  { path: "/",              element: <Home /> },
  { path: "/clubs/:id",     element: <ClubPage /> },
  { path: "*",              element: <NotFound /> },
];

export default routes;
