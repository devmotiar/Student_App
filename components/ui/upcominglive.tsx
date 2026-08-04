import Link from "next/link";
import {
  CalendarDays,
  Calendar,
} from "lucide-react";

const upcomingClasses = [
  {
    id: 1,
    title: "React Hooks Deep Dive",
    date: "Today, 10:00 AM",
    status: "Live",
    color: "from-pink-100 to-purple-100",
    icon: "text-purple-600",
    badge: "bg-red-50 text-red-600",
  },
  {
    id: 2,
    title: "JavaScript ES6+ Features",
    date: "Tomorrow, 2:00 PM",
    status: "Scheduled",
    color: "from-blue-100 to-cyan-100",
    icon: "text-blue-600",
    badge: "bg-blue-50 text-blue-600",
  },
  {
    id: 3,
    title: "State Management with Redux",
    date: "Jun 28, 11:00 AM",
    status: "Scheduled",
    color: "from-green-100 to-emerald-100",
    icon: "text-green-600",
    badge: "bg-blue-50 text-blue-600",
  },
];

export  function UpcomingLiveClasses() {
  return (
    <div className="w-full rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">
          Upcoming Live Classes
        </h2>

        <Link
          href="/live-classes"
          className="text-sm font-semibold text-blue-600 transition hover:text-blue-700"
        >
          View all
        </Link>
      </div>

      {/* Classes */}
      <div className="space-y-6">
        {upcomingClasses.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between"
          >
            {/* Left */}
            <div className="flex items-center gap-4">
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br ${item.color}`}
              >
                <Calendar
                  className={`h-5 w-5 ${item.icon}`}
                  strokeWidth={2.2}
                />
              </div>

              <div>
                <h3 className="text-[15px] font-semibold text-gray-900">
                  {item.title}
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                  {item.date}
                </p>
              </div>
            </div>

            {/* Status */}
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${item.badge}`}
            >
              {item.status === "Live" ? (
                <div className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>
                  Live
                </div>
              ) : (
                "Scheduled"
              )}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}