
import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

type RevealProps = {
    children: ReactNode;
};

export function Reveal({ children }: RevealProps) {
    const elementRef = useRef<HTMLDivElement>(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const element = elementRef.current;

        if (!element) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry?.isIntersecting) {
                    setVisible(true);
                    observer.disconnect();
                }
            },
            {
                threshold: 0.15,
            }
        );

        observer.observe(element);

        return () => observer.disconnect();
    }, []);

    return (
        <div
            ref={elementRef}
            className={`motion-safe:transition-all motion-safe:duration-700 motion-safe:ease-out ${
                visible
                    ? "opacity-100 translate-y-0"
                    : "motion-safe:opacity-0 motion-safe:translate-y-10"
            }`}
        >
            {children}
        </div>
    );
}
