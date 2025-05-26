import { useEffect, useState } from "react";
import { useNavigate } from "react-router";

interface SleepEntry {
    start: string;
    end: string;
    isExtra: boolean;
};


interface MainPageProps {
    isLoggedIn: boolean
};


const MainPage = ({isLoggedIn}: MainPageProps) => {
    const [selectedDay, setSelectedDay] = useState<"today" | "yesterday">("today");
    const [sleepEntries, setSleepEntries] = useState<SleepEntry[]>([
        { start: "", end: "", isExtra: false }
    ]);
    const [dailySummary, setDailySummary] = useState("");

    const handleEntryChange = <K extends keyof SleepEntry>(
        index: number,
        field: K,
        value: SleepEntry[K]
    ) => {
        const updated = [...sleepEntries];
        updated[index][field] = value;
        setSleepEntries(updated);
    };


    const navigate = useNavigate();

    useEffect(() => {
        if (isLoggedIn === false) {
            navigate("/");
        }
    }, [isLoggedIn, navigate]);



    const addSleepEntry = () => {
        setSleepEntries([...sleepEntries, { start: "", end: "", isExtra: false }]);
    };

    const handleSubmit = () => {
        const baseDate = new Date();
        if (selectedDay === "yesterday") baseDate.setDate(baseDate.getDate() - 1);
        baseDate.setHours(0, 0, 0, 0); // Set to start of the day

        const sleepHours = sleepEntries.map(({ start, end, isExtra }) => {
            const startDate = new Date(baseDate);
            const endDate = new Date(baseDate);

            const [sh, sm] = start.split(":").map(Number);
            const [eh, em] = end.split(":").map(Number);

            startDate.setHours(sh, sm);
            endDate.setHours(eh, em);
            if (endDate < startDate) endDate.setDate(endDate.getDate() + 1);


            setSleepEntries([{ start: "", end: "", isExtra: false }]);
            setDailySummary("");
            setSelectedDay("today");

            return {
                start: startDate.toISOString(),
                end: endDate.toISOString(),
                isExtra: !!isExtra,
            };
        });

        const finalData = {
            date: baseDate.toISOString(),
            summary: dailySummary,
            sleepHours: sleepHours,
        };

        // send request of entry to backend
        fetch("https://to-better-me-backend.onrender.com/api/user/daily_entry", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("authToken")}`
      },
      body: JSON.stringify(finalData),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to create entry");
        }
        return response.json();
      })
      .then((data) => {
        console.log("Entry creation successful:", data);
      })
      .catch((error) => {
        console.error("Error :", error);
        alert("Unable to create entry");
      });
    };

    return (
        <div className="min-h-full flex flex-col items-center justify-center text-white px-4 py-10 gradient-animate text-center">
            <div className="w-full max-w-xl p-6 rounded-xl bg-gradient-to-br from-slate-800 via-gray-950 to-slate-800 border border-slate-600 shadow-xl">
                <h1 className="text-4xl font-bold mb-6">Daily Tracker</h1>

                {/* Day Selector */}
                <div className="flex justify-center gap-4 mb-6">
                    {["today", "yesterday"].map((day) => (
                        <button
                            key={day}
                            onClick={() => setSelectedDay(day as "today" | "yesterday")}
                            className={`px-4 py-2 rounded-full text-sm font-semibold transition ${selectedDay === day
                                ? "bg-emerald-600 text-white"
                                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                                }`}
                        >
                            {day.charAt(0).toUpperCase() + day.slice(1)}
                        </button>
                    ))}
                </div>

                {/* Sleep Entries */}
                <div className="space-y-4 mb-8">
                    {sleepEntries.map((entry, index) => (
                        <div
                            key={index}
                            className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-700 pb-4"
                        >
                            <div className="flex flex-col text-left w-full">
                                <label className="text-slate-300 text-sm">Sleep Start</label>
                                <input
                                    type="time"
                                    value={entry.start}
                                    onChange={(e) =>
                                        handleEntryChange(index, "start", e.target.value)
                                    }
                                    className="px-3 py-2 rounded-md text-white bg-gray-800 border border-gray-600 focus:outline-none"
                                />
                            </div>
                            <div className="flex flex-col text-left w-full">
                                <label className="text-slate-300 text-sm">Sleep End</label>
                                <input
                                    type="time"
                                    value={entry.end}
                                    onChange={(e) =>
                                        handleEntryChange(index, "end", e.target.value)
                                    }
                                    className="px-3 py-2 rounded-md text-white bg-gray-800 border border-gray-600 focus:outline-none"
                                />
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                                <input
                                    type="checkbox"
                                    checked={entry.isExtra}
                                    onChange={(e) =>
                                        handleEntryChange(index, "isExtra", e.target.checked)
                                    }
                                    className="accent-emerald-500 w-4 h-4"
                                />
                                <label className="text-sm text-slate-300">Extra Sleep</label>
                            </div>
                        </div>
                    ))}

                    <button
                        onClick={addSleepEntry}
                        className="text-sm font-medium text-emerald-400 hover:underline mt-2"
                    >
                        + Add Another Sleep Interval
                    </button>
                </div>

                {/* Daily Summary Input */}
                <div className="mb-6">
                    <label
                        htmlFor="daily-summary"
                        className="block text-slate-300 text-left text-sm mb-1"
                    >
                        Daily Summary
                    </label>
                    <textarea
                        id="daily-summary"
                        rows={5}
                        value={dailySummary}
                        onChange={(e) => setDailySummary(e.target.value)}
                        className="w-full p-3 rounded-lg bg-gray-800 border border-gray-600 text-white focus:outline-none"
                        placeholder="Write about your day..."
                    />
                </div>

                {/* Submit Button */}
                <button
                    onClick={handleSubmit}
                    className="w-full px-4 py-3 bg-gradient-to-r from-blue-700 to-emerald-600 text-white rounded-xl font-semibold shadow-lg transition hover:scale-95"
                >
                    Save Entry
                </button>
            </div>
        </div>
    );
};

export default MainPage;
