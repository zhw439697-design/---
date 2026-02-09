import { BatteryCharging, Recycle } from "lucide-react";

export default function Logo({ className = "w-8 h-8", iconClassName = "w-5 h-5" }: { className?: string, iconClassName?: string }) {
    return (
        <div className={`relative flex items-center justify-center bg-emerald-500/10 rounded-lg ${className}`}>
            <div className="relative flex items-center justify-center">
                <Recycle className={`text-emerald-500 absolute opacity-30 ${iconClassName} scale-150`} />
                <BatteryCharging className={`text-emerald-500 relative z-10 ${iconClassName}`} />
            </div>
        </div>
    );
}
