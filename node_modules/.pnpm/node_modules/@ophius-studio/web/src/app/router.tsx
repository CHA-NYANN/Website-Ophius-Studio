import { createBrowserRouter, createRoutesFromElements, Route } from "react-router-dom";
import { AppShell } from "@/app/AppShell";
import { PagesLayout } from "@/app/layout/PagesLayout";
import { Home } from "@/pages/Home";
import { Docs } from "@/pages/Docs";
import { Projects } from "@/pages/Projects";
import { Team } from "@/pages/Team";
import { Gallery } from "@/pages/Gallery";
import { Media } from "@/pages/Media";
import { News } from "@/pages/News";
import { Contact } from "@/pages/Contact";
import { Games } from "@/pages/Games";
import { AdminLogin } from "@/admin/AdminLogin";
import { AdminGuard } from "@/admin/AdminGuard";
import { AdminLayout } from "@/admin/AdminLayout";
import { AdminDashboard } from "@/admin/AdminDashboard";
import { ProjectsAdmin } from "@/admin/pages/ProjectsAdmin";
import { NewsAdmin } from "@/admin/pages/NewsAdmin";
import { GalleryAdmin } from "@/admin/pages/GalleryAdmin";
import { MediaAdmin } from "@/admin/pages/MediaAdmin";
import { TeamAdmin } from "@/admin/pages/TeamAdmin";
import { DocsAdmin } from "@/admin/pages/DocsAdmin";
import { NotFound } from "@/components/common/NotFound";
import { RouteError } from "@/components/common/RouteError";

export const router = createBrowserRouter(
  createRoutesFromElements(
    <Route element={<AppShell />} errorElement={<RouteError />}>
      <Route index element={<Home />} />

      <Route element={<PagesLayout />}>
        <Route path="docs" element={<Docs />} />
        <Route path="projects" element={<Projects />} />
        <Route path="team" element={<Team />} />
        <Route path="gallery" element={<Gallery />} />
        <Route path="media" element={<Media />} />
        <Route path="news" element={<News />} />
        <Route path="contact" element={<Contact />} />
        <Route path="games" element={<Games />} />
      </Route>

      <Route path="admin/login" element={<AdminLogin />} />
      <Route element={<AdminGuard />}>
        <Route element={<AdminLayout />}>
          <Route path="admin" element={<AdminDashboard />} />
          <Route path="admin/projects" element={<ProjectsAdmin />} />
          <Route path="admin/news" element={<NewsAdmin />} />
          <Route path="admin/gallery" element={<GalleryAdmin />} />
          <Route path="admin/media" element={<MediaAdmin />} />
          <Route path="admin/team" element={<TeamAdmin />} />
          <Route path="admin/docs" element={<DocsAdmin />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Route>
  )
);
