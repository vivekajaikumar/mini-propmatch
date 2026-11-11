
import { Link } from "react-router-dom";
import type { Property } from "../types/property";

type PropertyCardProps = {
    property: Property;
};

export function PropertyCard({ property }: PropertyCardProps) {
    return (
        <Link
            to={`/properties/${property.id}`}
            className="group block overflow-hidden rounded-xl border border-white/10 bg-slate-900 transition-all duration-300 hover:-translate-y-1 hover:border-green-500/50 hover:shadow-lg hover:shadow-green-500/5 motion-reduce:transform-none"
        >
            <article className="select-none">
                <div className="h-56 overflow-hidden bg-green-950/30">
                    <img
                        src={property.imageUrl}
                        alt={property.title}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transform-none"
                    />
                </div>

                <div className="p-6">
                    <div className="mb-4 flex items-center justify-between">
            <span className="font-mono text-xs tracking-widest text-green-500">
              RESIDENTIAL
            </span>

                        <span className="text-xs text-gray-400">
              FOR SALE
            </span>
                    </div>

                    <h3 className="mb-3 text-xl font-semibold text-white">
                        {property.title}
                    </h3>

                    <p className="mb-6 text-sm text-gray-400">
                        {property.location}
                    </p>

                    <div className="flex items-center justify-between border-t border-white/10 pt-5">
                        <p className="text-2xl font-bold text-green-500">
                            ₹{property.price.toLocaleString("en-IN")}
                        </p>

                        <span className="text-xl text-green-500 transition-transform duration-300 group-hover:translate-x-1 motion-reduce:transform-none">
              →
            </span>
                    </div>
                </div>
            </article>
        </Link>
    );
}
