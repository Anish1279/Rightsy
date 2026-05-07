import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

/**
 * ActivityCard — Dashboard activity card.
 *
 * Displays an activity with image, title, description,
 * and a CTA button. Uses the activity's accent color
 * for visual variety.
 */
export default function Card({ title, description, image, color, link }) {
  /** Map bg-xxx to a softer border and button style */
  const colorMap = {
    "bg-purple-500": {
      border: "border-violet-200",
      hover: "hover:border-violet-400",
      btn: "bg-violet-600 hover:bg-violet-700",
      badge: "bg-violet-100 text-violet-700",
    },
    "bg-pink-500": {
      border: "border-pink-200",
      hover: "hover:border-pink-400",
      btn: "bg-pink-600 hover:bg-pink-700",
      badge: "bg-pink-100 text-pink-700",
    },
    "bg-blue-500": {
      border: "border-blue-200",
      hover: "hover:border-blue-400",
      btn: "bg-blue-600 hover:bg-blue-700",
      badge: "bg-blue-100 text-blue-700",
    },
    "bg-green-500": {
      border: "border-teal-200",
      hover: "hover:border-teal-400",
      btn: "bg-teal-600 hover:bg-teal-700",
      badge: "bg-teal-100 text-teal-700",
    },
    "bg-yellow-500": {
      border: "border-amber-200",
      hover: "hover:border-amber-400",
      btn: "bg-amber-600 hover:bg-amber-700",
      badge: "bg-amber-100 text-amber-700",
    },
    "bg-red-500": {
      border: "border-red-200",
      hover: "hover:border-red-400",
      btn: "bg-red-600 hover:bg-red-700",
      badge: "bg-red-100 text-red-700",
    },
    "bg-indigo-500": {
      border: "border-indigo-200",
      hover: "hover:border-indigo-400",
      btn: "bg-indigo-600 hover:bg-indigo-700",
      badge: "bg-indigo-100 text-indigo-700",
    },
  };

  const styles = colorMap[color] || colorMap["bg-purple-500"];

  return (
    <div
      className={`rounded-2xl overflow-hidden bg-white border-2 ${styles.border} ${styles.hover} card-hover`}
    >
      <div className="relative h-44 w-full overflow-hidden">
        <Image
          src={image || "/placeholder.svg"}
          alt={title}
          fill
          className="object-cover transition-transform duration-500 hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
      </div>

      <div className="p-5">
        <h2 className="text-lg font-bold mb-1.5 text-[var(--rightsy-text-primary)]">{title}</h2>
        <p className="text-sm text-[var(--rightsy-text-secondary)] mb-4 leading-relaxed">
          {description}
        </p>

        <Link href={link}>
          <button
            className={`${styles.btn} text-white font-bold py-2.5 px-5 rounded-xl text-sm transition-all flex items-center gap-1.5 shadow-sm hover:shadow-md`}
          >
            Open
            <ChevronRight className="w-4 h-4" />
          </button>
        </Link>
      </div>
    </div>
  );
}
