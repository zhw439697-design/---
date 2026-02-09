"use client";

import React, { ReactNode } from "react";

interface AuroraBackgroundProps {
    children: ReactNode;
    className?: string;
    showRadialGradient?: boolean;
    backgroundImage?: string;
    theme?: 'light' | 'dark';
}

export const AuroraBackground = ({
    className,
    children,
    showRadialGradient = true,
    backgroundImage,
    theme = 'dark',
    ...props
}: AuroraBackgroundProps) => {
    const isLight = theme === 'light';
    const bgImageWithCache = backgroundImage ? `${backgroundImage}?v=${new Date().getTime()}` : undefined;

    return (
        <main
            className={`relative flex min-h-screen flex-col items-center justify-center overflow-hidden transition-bg ${isLight ? "bg-gradient-to-br from-green-50 to-emerald-100 text-slate-900" : "bg-slate-950 text-slate-50"
                }`}
        >
            <div className="absolute inset-0 overflow-hidden">
                <div
                    className={`
            [--white-gradient:repeating-linear-gradient(100deg,var(--white)_0%,var(--white)_7%,var(--transparent)_10%,var(--transparent)_12%,var(--white)_16%)]
            [--dark-gradient:repeating-linear-gradient(100deg,var(--black)_0%,var(--black)_7%,var(--transparent)_10%,var(--transparent)_12%,var(--black)_16%)]
            [--aurora:repeating-linear-gradient(100deg,#3b82f6_10%,#a855f7_15%,#0ea5e9_20%,#a855f7_25%,#3b82f6_30%)]
            [background-image:var(--white-gradient),var(--aurora)]
            dark:[background-image:var(--dark-gradient),var(--aurora)]
            [background-size:300%,_200%]
            [background-position:50%_50%,_50%_50%]
            filter blur-[10px] invert dark:invert-0
            after:content-[""] after:absolute after:inset-0 after:[background-image:var(--white-gradient),var(--aurora)] 
            after:dark:[background-image:var(--dark-gradient),var(--aurora)]
            after:[background-size:200%,_100%] 
            after:animate-aurora after:[background-attachment:fixed] after:mix-blend-difference
            pointer-events-none
            absolute -inset-[10px] opacity-50 will-change-transform
            ${showRadialGradient ? '[mask-image:radial-gradient(ellipse_at_100%_0%,black_10%,var(--transparent)_70%)]' : ''}
          `}
                ></div>
            </div>
            {backgroundImage && (
                <>
                    <img
                        src={bgImageWithCache}
                        alt="Background"
                        className={`absolute inset-0 w-full h-full object-cover pointer-events-none ${isLight ? "opacity-60 mix-blend-multiply" : "opacity-30 mix-blend-screen"
                            }`}
                        onError={(e) => {
                            e.currentTarget.style.display = 'none';
                        }}
                    />
                    <div className={`absolute inset-0 pointer-events-none ${isLight ? "bg-white/60" : "bg-slate-950/40"
                        }`}></div>
                </>
            )}
            {children}
        </main>
    );
};
