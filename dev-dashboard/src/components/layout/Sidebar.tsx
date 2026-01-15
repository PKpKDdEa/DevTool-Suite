import { Link, useLocation } from "react-router-dom"
import { cn } from "@/lib/utils"
import { FileJson, GitCommit, Regex, LayoutDashboard } from "lucide-react"

const sidebarItems = [
    {
        title: "Commit Generator",
        href: "/commit-generator",
        icon: GitCommit,
    },
    {
        title: "JSON Converter",
        href: "/json-converter",
        icon: FileJson,
    },
    {
        title: "Regex Explainer",
        href: "/regex-explainer",
        icon: Regex,
    },
]

export function Sidebar() {
    const location = useLocation()

    return (
        <div className="flex h-screen w-64 flex-col border-r bg-card text-card-foreground">
            <div className="flex h-14 items-center border-b px-4">
                <Link to="/" className="flex items-center gap-2 font-semibold">
                    <LayoutDashboard className="h-6 w-6" />
                    <span>Dev Tools</span>
                </Link>
            </div>
            <nav className="flex-1 overflow-y-auto py-4">
                <ul className="grid gap-1 px-2">
                    {sidebarItems.map((item, index) => {
                        const isActive = location.pathname === item.href
                        return (
                            <li key={index}>
                                <Link
                                    to={item.href}
                                    className={cn(
                                        "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                                        isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground"
                                    )}
                                >
                                    <item.icon className="h-4 w-4" />
                                    {item.title}
                                </Link>
                            </li>
                        )
                    })}
                </ul>
            </nav>
            <div className="border-t p-4">
                <p className="text-xs text-muted-foreground">© 2026 Dev Tools Inc.</p>
            </div>
        </div>
    )
}
