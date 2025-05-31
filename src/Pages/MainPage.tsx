import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
const baseUrl = import.meta.env.VITE_BASE_URL;

interface SleepEntry {
    start: string;
    end: string;
}

interface MainPageProps {
    isLoggedIn: boolean;
}

const MainPage = ({ isLoggedIn }: MainPageProps) => {
    const [selectedDay, setSelectedDay] = useState<"today" | "yesterday">("today");
    const [sleepEntries, setSleepEntries] = useState<SleepEntry[]>([
        { start: "", end: "" }
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
        setSleepEntries([...sleepEntries, { start: "", end: "" }]);
    };

    // New function to remove individual sleep entry
    const removeSleepEntry = (index: number) => {
        // Only allow removal if there's more than one entry
        if (sleepEntries.length > 1) {
            const updated = sleepEntries.filter((_, i) => i !== index);
            setSleepEntries(updated);
        }
    };

    // Calculate total sleep hours for display
    const calculateTotalSleepHours = () => {
        const baseDate = new Date();
        if (selectedDay === "yesterday") baseDate.setDate(baseDate.getDate() - 1);
        baseDate.setHours(0, 0, 0, 0);

        let totalHours = 0;
        
        sleepEntries.forEach(({ start, end }) => {
            if (start && end) {
                const startDate = new Date(baseDate);
                const endDate = new Date(baseDate);

                const [sh, sm] = start.split(":").map(Number);
                const [eh, em] = end.split(":").map(Number);

                startDate.setHours(sh, sm);
                endDate.setHours(eh, em);
                if (endDate < startDate) endDate.setDate(endDate.getDate() + 1);

                const hours = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60);
                totalHours += hours;
            }
        });

        return totalHours;
    };

    const handleSubmit = () => {
        const baseDate = new Date();
        if (selectedDay === "yesterday") baseDate.setDate(baseDate.getDate() - 1);
        baseDate.setHours(0, 0, 0, 0); // Set to start of the day

        // Filter out empty entries before processing
        const validEntries = sleepEntries.filter(entry => entry.start && entry.end);
        
        if (validEntries.length === 0) {
            alert("Please add at least one complete sleep entry with both start and end times.");
            return;
        }

        const sleepHours = validEntries.map(({ start, end }) => {
            const startDate = new Date(baseDate);
            const endDate = new Date(baseDate);

            const [sh, sm] = start.split(":").map(Number);
            const [eh, em] = end.split(":").map(Number);

            startDate.setHours(sh, sm);
            endDate.setHours(eh, em);
            if (endDate < startDate) endDate.setDate(endDate.getDate() + 1);

            return {
                start: startDate.toISOString(),
                end: endDate.toISOString(),
            };
        });

        const finalData = {
            date: baseDate.toISOString(),
            summary: dailySummary,
            sleepHours: sleepHours,
        };

        // Reset form after processing data
        setSleepEntries([{ start: "", end: "" }]);
        setDailySummary("");
        setSelectedDay("today");

        // send request of entry to backend
        fetch(`${baseUrl}/api/user/daily_entry`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("authToken")}`
            },
            body: JSON.stringify(finalData),
        })
            .then((response) => {
                if (!response.ok) {
                    console.log("Failed to create entry");
                    throw new Error("Failed to create entry");
                }
                return response.json();
            })
            .then(() => {
                alert("Sleep entry saved successfully!");
            })
            .catch((error) => {
                console.error("Error:", error);
                alert("Unable to create entry. Please try again.");
            });
    };

    const totalSleepHours = calculateTotalSleepHours();

    return (
        <div className="min-h-full flex flex-col items-center justify-center select-none text-white px-4 py-10 bg-slate-950 text-center">
            <div className="select-none w-full max-w-2xl p-6 rounded-xl bg-gradient-to-br from-slate-800 via-gray-950 to-slate-800 border border-slate-600 shadow-xl">
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

                {/* Total Sleep Hours Display */}
                {totalSleepHours > 0 && (
                    <div className="mb-4 p-3 bg-gray-800 rounded-lg border border-gray-600">
                        <p className="text-white">
                            <span className="text-slate-300 font-semibold">Total Sleep Hours: </span>
                            <span className={`font-bold ${totalSleepHours >= 7 && totalSleepHours <= 8 ? 'text-green-400' : 'text-yellow-400'}`}>
                                {totalSleepHours.toFixed(1)} hours
                            </span>
                        </p>
                    </div>
                )}

                {/* Sleep Entries */}
                <div className="space-y-4 mb-6">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-semibold text-slate-300">Sleep Periods</h3>
                        <button
                            onClick={addSleepEntry}
                            className="px-3 py-1 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition duration-300 text-sm font-medium"
                        >
                            + Add Sleep Period
                        </button>
                    </div>

                    <div className="space-y-3 max-h-80 overflow-y-auto">
                        {sleepEntries.map((entry, index) => (
                            <div
                                key={index}
                                className="bg-gray-800 p-4 rounded-lg border border-gray-600"
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-white font-medium text-sm">
                                        Sleep Period {index + 1}
                                    </span>
                                    {sleepEntries.length > 1 && (
                                        <button
                                            onClick={() => removeSleepEntry(index)}
                                            className="px-2 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 transition duration-300 text-xs font-medium"
                                        >
                                            Delete
                                        </button>
                                    )}
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="flex flex-col text-left">
                                        <label className="text-slate-300 text-sm mb-1">Sleep Start</label>
                                        <input
                                            type="time"
                                            value={entry.start}
                                            onChange={(e) =>
                                                handleEntryChange(index, "start", e.target.value)
                                            }
                                            className="px-3 py-2 rounded-md text-white bg-gray-700 border border-gray-500 focus:outline-none focus:border-blue-500"
                                        />
                                    </div>
                                    <div className="flex flex-col text-left">
                                        <label className="text-slate-300 text-sm mb-1">Sleep End</label>
                                        <input
                                            type="time"
                                            value={entry.end}
                                            onChange={(e) =>
                                                handleEntryChange(index, "end", e.target.value)
                                            }
                                            className="px-3 py-2 rounded-md text-white bg-gray-700 border border-gray-500 focus:outline-none focus:border-blue-500"
                                        />
                                    </div>
                                </div>

                                {/* Show calculated hours for this specific period */}
                                {entry.start && entry.end && (
                                    <div className="mt-2 text-xs text-slate-400">
                                        Duration: {(() => {
                                            const baseDate = new Date();
                                            if (selectedDay === "yesterday") baseDate.setDate(baseDate.getDate() - 1);
                                            baseDate.setHours(0, 0, 0, 0);

                                            const startDate = new Date(baseDate);
                                            const endDate = new Date(baseDate);

                                            const [sh, sm] = entry.start.split(":").map(Number);
                                            const [eh, em] = entry.end.split(":").map(Number);

                                            startDate.setHours(sh, sm);
                                            endDate.setHours(eh, em);
                                            if (endDate < startDate) endDate.setDate(endDate.getDate() + 1);

                                            const hours = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60);
                                            return hours.toFixed(1);
                                        })()} hours
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Daily Summary Input */}
                <div className="mb-6">
                    <label
                        htmlFor="daily-summary"
                        className="block text-slate-300 text-left text-sm mb-2 font-semibold"
                    >
                        Daily Summary
                    </label>
                    <textarea
                        id="daily-summary"
                        rows={5}
                        value={dailySummary}
                        onChange={(e) => setDailySummary(e.target.value)}
                        className="w-full p-3 rounded-lg bg-gray-800 border border-gray-600 text-white focus:outline-none focus:border-blue-500 resize-none"
                        placeholder="Write about your day, sleep quality, dreams, or anything noteworthy..."
                    />
                </div>

                {/* Submit Button */}
                <button
                    onClick={handleSubmit}
                    className="w-full px-4 py-3 bg-gradient-to-r from-blue-700 to-emerald-600 text-white rounded-xl font-semibold shadow-lg transition hover:scale-95 hover:shadow-xl"
                >
                    Save Entry ({sleepEntries.filter(e => e.start && e.end).length} sleep period{sleepEntries.filter(e => e.start && e.end).length !== 1 ? 's' : ''})
                </button>
            </div>
        </div>
    );
};

export default MainPage;