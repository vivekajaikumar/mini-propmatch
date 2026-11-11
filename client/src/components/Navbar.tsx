
import { Link } from "react-router-dom";

export function Navbar() {
    return (
        <header className="border-b border-white/10">
            <nav className="mx-auto flex w-full max-w-[1400px] items-center justify-between gap-4 border-x border-white/10 px-5 py-3 md:w-[85%] md:px-10 lg:px-16">
                <Link
                    to="/"
                    className="flex shrink-0 items-center gap-3"
                >
          <span className="flex h-8 w-8 items-center justify-center rounded bg-green-500 text-lg font-bold text-black">
            P
          </span>

                    <span className="text-base font-bold tracking-wide">
            PROPMATCH
          </span>
                </Link>

                <div className="flex flex-wrap items-center justify-end gap-3 md:gap-6">
                    <Link
                        to="/#properties"
                        className="text-sm text-gray-400 transition-colors hover:text-white"
                    >
                        Properties
                    </Link>

                    <Link
                        to="/properties/new"
                        className="rounded border border-green-500/50 px-3 py-2 text-xs font-semibold text-green-400 transition-colors hover:border-green-400 hover:bg-green-500/10 md:px-4 md:text-sm"
                    >
                        + List Property
                    </Link>

                    <Link
                        to="/#properties"
                        className="hidden rounded bg-green-500 px-4 py-2 text-xs font-semibold text-black transition-colors hover:bg-green-400 md:inline-flex md:text-sm"
                    >
                        Explore homes
                    </Link>
                </div>
            </nav>
        </header>
    );
}
