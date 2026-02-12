import { createBrowserRouter, Navigate } from "react-router";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import CreateLead from "./pages/leads/CreateLead";
import LeadRepository from "./pages/leads/LeadRepository";
import ServiceAlignment from "./pages/intelligence/ServiceAlignment";
import AlignmentHistory from "./pages/intelligence/AlignmentHistory";
import Output from "./pages/intelligence/Output";
import PitchResult from "./pages/intelligence/PitchResult";
import CreateEngagement from "./pages/engagement/CreateEngagement";
import EngagementHistory from "./pages/engagement/EngagementHistory";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Login,
  },
  {
    path: "/dashboard",
    Component: Dashboard,
  },
  {
    path: "/leads",
    children: [
      {
        index: true,
        element: <Navigate to="/leads/repository" replace />,
      },
      {
        path: "create",
        Component: CreateLead,
      },
      {
        path: "repository",
        Component: LeadRepository,
      },
    ],
  },
  {
    path: "/intelligence",
    children: [
      {
        index: true,
        element: <Navigate to="/intelligence/alignment" replace />,
      },
      {
        path: "alignment",
        Component: ServiceAlignment,
      },
      {
        path: "alignment/:leadId",
        Component: ServiceAlignment,
      },
      {
        path: "history",
        Component: AlignmentHistory,
      },
      {
        path: "output",
        Component: Output,
      },
      {
        path: "output/:leadId",
        Component: Output,
      },
      {
        path: "pitch-result/:pitchId",
        Component: PitchResult,
      },
    ],
  },
  {
    path: "/engagement",
    children: [
      {
        index: true,
        element: <Navigate to="/engagement/create" replace />,
      },
      {
        path: "create",
        Component: CreateEngagement,
      },
      {
        path: "history",
        Component: EngagementHistory,
      },
    ],
  },
]);
