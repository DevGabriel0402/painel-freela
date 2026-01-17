import { ChartNoAxesCombined, Briefcase, Users, Settings, Star } from "lucide-react";

export const NAV_ITEMS = [
    { key: "dashboard", label: "Dashboard", icon: ChartNoAxesCombined, path: "/dashboard" },
    { key: "jobs", label: "Jobs", icon: Briefcase, path: "/jobs" },
    { key: "clientes", label: "Clientes", icon: Users, path: "/clientes" },
    { key: "feedback", label: "Avaliações", icon: Star, path: "/feedback" },
    { key: "settings", label: "Configurações", icon: Settings, path: "/settings" },
];
