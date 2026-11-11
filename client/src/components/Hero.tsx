
import { Link } from "react-router-dom";

export function Hero() {
    return (
        <section className="relative overflow-hidden border-b border-white/10">
            <div className="mx-auto w-full max-w-[1400px] border-x border-white/10 px-5 py-14 md:w-[85%] md:px-10 md:py-20 lg:px-16">
                <p className="mb-6 font-mono text-xs tracking-widest text-green-500 md:text-sm">
                    DISCOVER. COMPARE. FIND YOUR HOME.
                </p>

                <h1 className="max-w-4xl text-4xl font-bold leading-[1.12] tracking-tight sm:text-5xl md:text-6xl">
                    Find your place.
                    <br />
                    <span className="text-green-500">
            Live better.
          </span>
                </h1>

                <p className="mt-6 max-w-xl text-sm leading-relaxed text-gray-400 md:text-base">
                    Explore thoughtfully selected homes and find the
                    property that matches your lifestyle.
                </p>

                <div className="mt-8 flex flex-wrap gap-3">
                    <Link
                        to="/#properties"
                        className="rounded bg-green-500 px-5 py-2.5 text-sm font-semibold text-black transition-colors hover:bg-green-400"
                    >
                        Explore homes
                    </Link>

                    <Link
                        to="/#properties"
                        className="rounded border border-white/20 px-5 py-2.5 text-sm font-semibold transition-colors hover:bg-white/10"
                    >
                        View listings
                    </Link>
                </div>

                <div className="mt-10 flex w-fit flex-wrap divide-x divide-green-900 rounded-lg border border-green-900">
                    <div className="px-5 py-3">
                        <p className="font-mono text-xl font-bold text-green-500">
                            02
                        </p>
                        <p className="text-[11px] text-gray-400">
                            LISTINGS
                        </p>
                    </div>

                    <div className="px-5 py-3">
                        <p className="font-mono text-xl font-bold text-green-500">
                            01
                        </p>
                        <p className="text-[11px] text-gray-400">
                            PLATFORM
                        </p>
                    </div>

                    <div className="px-5 py-3">
                        <p className="font-mono text-xl font-bold text-green-500">
                            24/7
                        </p>
                        <p className="text-[11px] text-gray-400">
                            DISCOVERY
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
