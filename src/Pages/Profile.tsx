import React, { useState, useEffect, useCallback, useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
const baseUrl = import.meta.env.VITE_BASE_URL;

import type { TooltipProps } from 'recharts';

interface User {
  _id: string;
  username: string;
  email: string;
  isSpecial: boolean;
  __v: number;
}

interface SleepHour {
  start: string;
  end: string;
  isExtra: boolean;
  _id: string;
}

interface SleepEntry {
  _id: string;
  userId: string;
  date: string;
  summary: string;
  sleepHours: SleepHour[];
  __v: number;
}

interface ApiResponse {
  message: string;
  deletedUsersCount: number;
  currentUser: User;
}

interface ChartData {
  date: string;
  sleepHours: number;
  summary: string;
  color: string;
  formattedDate: string;
}

const Profile: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [sleepData, setSleepData] = useState<SleepEntry[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<ChartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editSummary, setEditSummary] = useState("");
  const [editSleepHours, setEditSleepHours] = useState<number>(0);
  const [isEditing, setIsEditing] = useState(false);

  // Fixed useEffect - added dependency array to prevent infinite calls
  useEffect(() => {
    fetchUserData();
    fetchSleepData();
  }, []); // Empty dependency array means this runs only once on mount

  const fetchUserData = useCallback(async () => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(`${baseUrl}/api/user/get_current`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch user data`); // Fixed: removed sleepData reference
      }

      const data: ApiResponse = await response.json();
      setUser(data.currentUser);
    } catch (err) {
      setError("Failed to load user data");
      console.error("Error fetching user data:", err);
    }
  }, []); // No dependencies needed

  const fetchSleepData = useCallback(async () => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(`${baseUrl}/api/user/get_all_entries`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch sleep data");
      }

      const data: SleepEntry[] = await response.json();
      setSleepData(data);
    } catch (err) {
      setError("Failed to load sleep data");
      console.error("Error fetching sleep data:", err);
    } finally {
      setLoading(false);
    }
  }, []); // No dependencies needed

  // Memoized calculation functions to prevent unnecessary recalculations
  const calculateSleepHours = useCallback((sleepHours: SleepHour[]): number => {
    return sleepHours.reduce((total, sleep) => {
      const start = new Date(sleep.start);
      const end = new Date(sleep.end);
      const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
      return total + hours;
    }, 0);
  }, []);

  // Memoized chart data processing
  const chartData = useMemo(() => {
    const processedData = sleepData.map(entry => {
      const totalSleepHours = calculateSleepHours(entry.sleepHours);
      const isOptimal = totalSleepHours >= 7 && totalSleepHours <= 8;
      const date = new Date(entry.date);

      return {
        date: entry.date,
        sleepHours: parseFloat(totalSleepHours.toFixed(1)),
        summary: entry.summary,
        color: isOptimal ? '#10B981' : '#EF4444',
        formattedDate: date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric'
        })
      };
    });

    // Sort by date to ensure proper order
    return processedData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [sleepData, calculateSleepHours]);

  // Memoized statistics calculations
  const statistics = useMemo(() => {
    if (chartData.length === 0) return null;

    const totalDays = chartData.length;
    const optimalDays = chartData.filter(d => d.color === '#10B981').length;
    const averageSleep = chartData.reduce((sum, d) => sum + d.sleepHours, 0) / chartData.length;
    const successRate = Math.round((optimalDays / totalDays) * 100);

    return {
      totalDays,
      optimalDays,
      averageSleep: averageSleep.toFixed(1),
      successRate
    };
  }, [chartData]);

  const handleBarClick = useCallback((data: ChartData) => {
    setSelectedEntry(data);
    setEditSummary(data.summary);
    setEditSleepHours(data.sleepHours);
    setIsEditing(false);
  }, []);

  const handleEditClick = useCallback(() => {
    setIsEditing(true);
  }, []);

  const handleCancelEdit = useCallback(() => {
    setIsEditing(false);
    if (selectedEntry) {
      setEditSummary(selectedEntry.summary);
      setEditSleepHours(selectedEntry.sleepHours);
    }
  }, [selectedEntry]);

  const handleUpdateEntry = useCallback(async () => {
    try {
      const token = localStorage.getItem("authToken");
      const entryToUpdate = sleepData.find(e => e.date === selectedEntry?.date);

      if (!entryToUpdate) {
        alert("Entry not found");
        return;
      }

      const finalData: { date: string; summary: string; sleepHours: SleepHour[] } = {
        date: new Date(entryToUpdate.date).toISOString(),
        summary: editSummary,
        sleepHours: [], 
      };

      const totalSleep = editSleepHours;
      finalData.sleepHours = entryToUpdate.sleepHours.map(s => ({
        ...s,
        end: new Date(new Date(s.start).getTime() + (totalSleep / entryToUpdate.sleepHours.length) * 3600000).toISOString(),
      })); 

      const response = await fetch(`${baseUrl}/api/user/update_entry/${entryToUpdate._id}`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(finalData),
      });

      if (!response.ok) {
        throw new Error("Failed to update entry");
      }

      // alert("Entry updated successfully!");
      setIsEditing(false);
      setSelectedEntry(null);
      fetchSleepData(); // refresh data
    } catch (error) {
      console.error("Update error:", error);
      alert("Error updating entry");
    }
  }, [editSummary, editSleepHours, selectedEntry, sleepData, fetchSleepData]);

  // Memoized custom tooltip component
  const CustomTooltip = useMemo(() => {
    const TooltipComponent: React.FC<TooltipProps<number, string>> = ({ active, payload }) => {
      if (active && payload && payload.length) {
        const data = payload[0].payload as ChartData;
        return (
          <div className="bg-gray-800 p-3 rounded-lg border border-gray-600 shadow-lg">
            <p className="text-white font-semibold">{`Date: ${data.formattedDate}`}</p>
            <p className="text-white">{`Sleep: ${data.sleepHours} hours`}</p>
            <p className="text-gray-300 text-sm">{`Click to view summary`}</p>
          </div>
        );
      }
      return null;
    };
    return TooltipComponent;
  }, []);

  const handleRetry = useCallback(() => {
    setError(null);
    setLoading(true);
    fetchUserData();
    fetchSleepData();
  }, [fetchUserData, fetchSleepData]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center text-center px-4 py-10 min-h-full bg-black ">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <p className="text-white mt-4">Loading profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center text-center px-4 py-10 min-h-full bg-black ">
        <p className="text-red-400 text-xl">{error}</p>
        <button
          onClick={handleRetry}
          className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className=" min-h-full bg-black text-white p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* User Profile Section */}
        {user && (
          <div className="bg-gradient-to-br from-slate-800 via-gray-950 to-slate-800 border border-slate-600 rounded-xl p-6 shadow-xl ">
            <h1 className="text-4xl font-bold text-center mb-6">User Profile</h1>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <span className="text-slate-300 font-semibold">Username:</span>
                  <span className="text-white text-lg">{user.username}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-slate-300 font-semibold">Email:</span>
                  <span className="text-white text-lg">{user.email}</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <span className="text-slate-300 font-semibold">Status:</span>
                  <span className={`text-lg font-semibold ${user.isSpecial ? 'text-green-400' : 'text-yellow-400'}`}>
                    {user.isSpecial ? 'Special User' : 'Regular User'}
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-slate-300 font-semibold">User ID:</span>
                  <span className="text-gray-400 text-sm font-mono">{user._id}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Sleep Data Chart Section */}
        <div className="bg-gradient-to-br from-slate-800 via-gray-950 to-slate-800 border border-slate-600 rounded-xl p-6 shadow-xl">
          <h2 className="text-3xl font-bold text-center mb-6 ">30-Day Sleep Analysis</h2>

          {chartData.length > 0 ? (
            <div className="space-y-6">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis
                      dataKey="formattedDate"
                      stroke="#9CA3AF"
                      fontSize={12}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis
                      stroke="#9CA3AF"
                      fontSize={12}
                      label={{ value: 'Sleep Hours', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar
                      dataKey="sleepHours"
                      cursor="pointer"
                      onClick={handleBarClick}
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Legend */}
              <div className="flex justify-center space-x-6 text-sm ">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-green-500 rounded"></div>
                  <span className="text-gray-300">Optimal Sleep (7-8 hours)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-red-500 rounded"></div>
                  <span className="text-gray-300">Sub-optimal Sleep</span>
                </div>
              </div>

              {/* Selected Entry Details */}
              {selectedEntry && (
                <div className="bg-gray-800 border border-gray-600 rounded-lg p-4 mt-6 ">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-xl font-semibold text-blue-400">
                      Sleep Details - {selectedEntry.formattedDate}
                    </h3>
                    {!isEditing && (
                      <button
                        onClick={handleEditClick}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-300 text-sm"
                      >
                        Edit Entry
                      </button>
                    )}
                  </div>
                  
                  <div className="space-y-3">
                    <p className="text-white">
                      <span className="text-slate-300 font-semibold">Sleep Duration:</span> {selectedEntry.sleepHours} hours
                    </p>
                    
                    <p className="text-white">
                      <span className="text-slate-300 font-semibold">Status:</span>
                      <span className={`ml-2 font-semibold ${selectedEntry.color === '#10B981' ? 'text-green-400' : 'text-red-400'}`}>
                        {selectedEntry.color === '#10B981' ? 'Optimal Sleep' : 'Sub-optimal Sleep'}
                      </span>
                    </p>

                    {/* Summary Section */}
                    <div className="space-y-2">
                      <span className="text-slate-300 font-semibold block">Summary:</span>
                      {!isEditing ? (
                        <p className="text-white bg-gray-700 p-3 rounded-md border border-gray-600 min-h-[80px] select-text">
                          {selectedEntry.summary || "No summary available"}
                        </p>
                      ) : (
                        <textarea
                          value={editSummary}
                          onChange={(e) => setEditSummary(e.target.value)}
                          className="w-full p-3 bg-gray-700 text-white rounded-md resize-none border border-gray-600 min-h-[80px]"
                          rows={3}
                          placeholder="Enter your sleep summary..."
                        />
                      )}
                    </div>

                    {/* Sleep Hours Section - Only show in edit mode */}
                    {isEditing && (
                      <div className="space-y-2">
                        <label className="block text-slate-300 font-semibold">Sleep Hours (total):</label>
                        <input
                          type="number"
                          value={editSleepHours}
                          onChange={(e) => setEditSleepHours(parseFloat(e.target.value))}
                          className="w-full p-2 bg-gray-700 text-white rounded-md border border-gray-600"
                          step="0.1"
                          min="0"
                          max="24"
                        />
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex space-x-3 pt-3">
                      {isEditing ? (
                        <>
                          <button
                            onClick={handleUpdateEntry}
                            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition duration-300"
                          >
                            Save Changes
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition duration-300"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => setSelectedEntry(null)}
                          className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition duration-300"
                        >
                          Close Details
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg">No sleep data available</p>
              <p className="text-gray-500 text-sm mt-2">Start tracking your sleep to see your progress here</p>
            </div>
          )}
        </div>

        {/* Summary Statistics */}
        {statistics && (
          <div className="bg-gradient-to-br from-slate-800 via-gray-950 to-slate-800 border border-slate-600 rounded-xl p-6 shadow-xl ">
            <h3 className="text-2xl font-bold text-center mb-4">Sleep Statistics</h3>
            <div className="grid md:grid-cols-4 gap-4 text-center">
              <div className="bg-gray-800 rounded-lg p-4">
                <p className="text-2xl font-bold text-blue-400">{statistics.totalDays}</p>
                <p className="text-gray-300 text-sm">Total Days</p>
              </div>
              <div className="bg-gray-800 rounded-lg p-4">
                <p className="text-2xl font-bold text-green-400">{statistics.optimalDays}</p>
                <p className="text-gray-300 text-sm">Optimal Days</p>
              </div>
              <div className="bg-gray-800 rounded-lg p-4">
                <p className="text-2xl font-bold text-yellow-400">{statistics.averageSleep}h</p>
                <p className="text-gray-300 text-sm">Average Sleep</p>
              </div>
              <div className="bg-gray-800 rounded-lg p-4">
                <p className="text-2xl font-bold text-purple-400">{statistics.successRate}%</p>
                <p className="text-gray-300 text-sm">Success Rate</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;