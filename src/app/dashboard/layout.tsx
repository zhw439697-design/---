import Sidebar from "@/components/Sidebar";


export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen bg-slate-900 text-slate-100">
            {/* Sidebar */}
            <Sidebar />

            {/* Main Content */}
            <main className="ml-64 flex-1 p-8 overflow-y-auto">
                {children}
            </main>
        </div>
    );
}

