import {
    Home,
    Users,
    FileText,
    User,
    IndianRupee
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type Route = {
    label: string;
    href: string;
    icon: LucideIcon;
    external?: boolean;
};

export const adminRoutes: Route[] = [
    {
        label: "Dashboard",
        href: "/admin/dashboard",
        icon: Home,
    },
    {
        label: "Users",
        href: "/admin/users",
        icon: Users,
    },
    {
        label: "Documents",
        href: "/admin/documents",
        icon: FileText,
    },
    {
        label: "Profile",
        href: "/admin/profile",
        icon: User,
    },
];

export const userRoutes: Route[] = [
    {
        label: "Dashboard",
        href: "/user/dashboard",
        icon: Home,
    },
    {
        label: "Documents",
        href: "/user/documents",
        icon: FileText,
    },
    {
        label: "Profile",
        href: "/user/profile",
        icon: User,
    },
    {
        label: "General Guidelines",
        href: "/user/general-guidelines",
        icon: FileText,
    },
    {
        label: "Holidays",
        href: "/user/holidays",
        icon: FileText,
    },
    {
        label: "Expense Tracker",
        href: "https://expense.fastcode.ai/auth/login",
        icon: IndianRupee,
        external: true,
    },
];
