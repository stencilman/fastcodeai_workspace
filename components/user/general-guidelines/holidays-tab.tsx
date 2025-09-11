"use client";

import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  format,
  addDays,
  getDay,
  isSameMonth,
} from "date-fns";
import { useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils/utils";

// --- Data Definitions ---

interface Holiday {
  iso: string; // ISO date string: "yyyy-MM-dd"
  name: string;
}

const holidays2025: Holiday[] = [
  { iso: "2025-01-01", name: "New Year's Day" },
  { iso: "2025-01-14", name: "Pongal" },
  { iso: "2025-02-26", name: "Maha Shivratri" },
  { iso: "2025-03-14", name: "Holi" },
  { iso: "2025-03-31", name: "Eid al-Fitr" },
  { iso: "2025-08-15", name: "Independence Day" },
  { iso: "2025-08-27", name: "Ganesh Chaturthi" },
  { iso: "2025-10-01", name: "Dusshera" },
  { iso: "2025-10-02", name: "Gandhi Jayanti" },
  { iso: "2025-10-21", name: "Diwali" },
];

// --- Pre-computed Data for Efficiency ---

// Create a map for quick holiday lookups by ISO date.
// This supports multiple holidays on the same day.
const holidayMap = holidays2025.reduce<Record<string, string[]>>((acc, h) => {
  acc[h.iso] = acc[h.iso] ? [...acc[h.iso], h.name] : [h.name];
  return acc;
}, {});

// Find the ISO string of the next upcoming holiday.
// This is calculated only once when the module loads.
const nextIso = holidays2025
  .map((h) => new Date(h.iso))
  .filter((d) => d >= new Date())
  .sort((a, b) => a.getTime() - b.getTime())[0]
  ?.toISOString()
  .slice(0, 10);

// --- React Components ---

/**
 * Main component to display a grid of monthly calendars for the year 2025.
 */
export default function HolidaysTab() {
  const year = 2025;
  const months = Array.from({ length: 12 }, (_, i) => new Date(year, i, 1));

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {months.map((monthDate, index) => (
        <MonthCard key={`month-${monthDate.getMonth()}-${index}`} monthDate={monthDate} />
      ))}
    </div>
  );
}

interface MonthCardProps {
  monthDate: Date;
}

/**
 * Renders a single month's calendar card, highlighting holidays.
 */
function MonthCard({ monthDate }: MonthCardProps) {
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [selectedHoliday, setSelectedHoliday] = useState<string[] | null>(null);
  const monthLabel = format(monthDate, "MMMM");
  const start = startOfMonth(monthDate);
  const end = endOfMonth(monthDate);

  // Create a 6x7 grid of days, including days from the previous and next months
  // to ensure the calendar grid is always full.
  const days = eachDayOfInterval({
    start: addDays(start, -getDay(start)),
    end: addDays(end, 6 - getDay(end)),
  });

  return (
    <div className="border rounded-lg bg-white dark:bg-slate-900 shadow-sm p-4">
      <h3 className="text-center font-semibold mb-2">{monthLabel}</h3>
      <div className="grid grid-cols-7 gap-1 text-xs select-none">
        {/* Day of the week headers */}
        {["S", "M", "T1", "W", "T2", "F", "S2"].map((dayInitial, index) => (
          <div
            key={`day-header-${index}`}
            className="text-center font-medium text-slate-500 dark:text-slate-400"
          >
            {dayInitial.charAt(0)}
          </div>
        ))}

        {/* Calendar day cells */}
        {days.map((day) => {
          const iso = format(day, "yyyy-MM-dd");
          const inCurrentMonth = isSameMonth(day, monthDate);
          const holidays = holidayMap[iso];
          const isNextUpcomingHoliday = iso === nextIso;

          return (
            <Tooltip key={iso}>
              <TooltipTrigger asChild>
                <div
                  className={cn(
                    "h-6 w-6 flex items-center justify-center rounded-full transition-colors",
                    !inCurrentMonth && "text-slate-400 dark:text-slate-600",
                    holidays && "bg-primary/20 text-primary font-bold border border-primary/30",
                    isNextUpcomingHoliday && "ring-2 ring-green-600 bg-primary/30",
                    "cursor-pointer"
                  )}
                  onClick={() => {
                    if (holidays) {
                      setSelectedDay(format(day, "MMM d"));
                      setSelectedHoliday(holidays);
                    } else {
                      setSelectedDay(null);
                      setSelectedHoliday(null);
                    }
                  }}
                >
                  {format(day, "d")}
                </div>
              </TooltipTrigger>
              {holidays && (
                <TooltipContent>{holidays.join(", ")}</TooltipContent>
              )}
            </Tooltip>
          );
        })}
      </div>
      
      {/* Mobile-friendly holiday info */}
      {selectedDay && selectedHoliday && (
        <div className="mt-2 p-2 text-xs bg-slate-100 dark:bg-slate-800 rounded-md">
          <p className="font-medium">{selectedDay}:</p>
          <p className="text-primary">{selectedHoliday.join(", ")}</p>
        </div>
      )}
    </div>
  );
}
