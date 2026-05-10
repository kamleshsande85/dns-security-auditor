/*
PROFESSIONAL DNS SECURITY AUDITOR DASHBOARD
WITH MODERN UI, ANIMATIONS & BETTER NAVIGATION
*/

import React, { useState, useEffect } from "react";
import axios from "axios";

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [domain, setDomain] = useState("");
  const [scanning, setScanning] = useState(false);
  const [scanResults, setScanResults] = useState(null);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState(null);
  const [exporting, setExporting] = useState(false);
  const [activeTab, setActiveTab] = useState("scan");
  const [expandedSections, setExpandedSections] = useState({
    email: true,
    infrastructure: true,
    records: false,
  });

  useEffect(() => {
    fetchStats();
    fetchHistory();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get("/api/dashboard/stats/");
      setStats(response.data);
    } catch (err) {
      console.error("Failed to fetch stats", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    try {
      const response = await axios.get("/api/history/");
      setHistory(response.data);
    } catch (err) {
      console.error("Failed to fetch history", err);
    }
  };

  const startAdvancedScan = async () => {
    if (!domain) return;

    setScanning(true);
    setError(null);
    setScanResults(null);

    try {
      const response = await axios.post("/api/advanced-scan/", { domain });
      setScanResults(response.data);
      await fetchStats();
      await fetchHistory();
    } catch (err) {
      setError(
        err.response?.data?.error ||
          "Scan failed. Please check domain and try again.",
      );
    } finally {
      setScanning(false);
    }
  };

  const exportToPDF = async (auditId, domainName) => {
    if (!auditId) {
      alert("No scan ID available. Please scan a domain first.");
      return;
    }

    setExporting(true);
    try {
      const response = await axios.get(`/api/export/${auditId}/`, {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `dns_security_report_${domainName}_${auditId}.pdf`,
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("PDF export failed:", err);
      alert("Failed to generate PDF report. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  const exportToJSON = () => {
    if (!scanResults) {
      alert("No scan results to export.");
      return;
    }

    const dataStr = JSON.stringify(scanResults, null, 2);
    const dataUri =
      "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);
    const exportFileDefaultName = `dns_scan_${scanResults.domain}_${Date.now()}.json`;

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();
  };

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const getScoreColor = (score) => {
    if (score >= 80) return "#10b981"; // Green
    if (score >= 60) return "#f59e0b"; // Amber
    if (score >= 40) return "#f97316"; // Orange
    return "#ef4444"; // Red
  };

  const getScoreBgColor = (score) => {
    if (score >= 80) return "rgba(16, 185, 129, 0.1)";
    if (score >= 60) return "rgba(245, 158, 11, 0.1)";
    if (score >= 40) return "rgba(249, 115, 22, 0.1)";
    return "rgba(239, 68, 68, 0.1)";
  };

  const getGradeColor = (grade) => {
    if (grade === "A+" || grade === "A") return "#10b981";
    if (grade === "B") return "#f59e0b";
    if (grade === "C") return "#f97316";
    if (grade === "D") return "#ef4444";
    return "#6b7280";
  };

  const getSeverityColor = (risk) => {
    const colors = {
      critical: { bg: "#dc2626", text: "white", icon: "🔴" },
      high: { bg: "#ea580c", text: "white", icon: "🟠" },
      warning: { bg: "#f59e0b", text: "white", icon: "⚠️" },
      pass: { bg: "#10b981", text: "white", icon: "✅" },
      info: { bg: "#3b82f6", text: "white", icon: "ℹ️" },
    };
    return (
      colors[risk?.toLowerCase()] || {
        bg: "#6b7280",
        text: "white",
        icon: "❓",
      }
    );
  };

  const CircularProgress = ({ score, size = 120 }) => {
    const radius = 50;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score / 100) * circumference;
    const color = getScoreColor(score);

    return (
      <div className="relative inline-flex items-center justify-center">
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#e5e7eb"
            strokeWidth="8"
            fill="none"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth="8"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute text-center">
          <div className="text-3xl font-bold" style={{ color }}>
            {score}
          </div>
          <div className="text-xs text-gray-500">SCORE</div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">
            Loading DNS Security Auditor...
          </p>
        </div>
      </div>
    );
  }

  // Clear single history item
  const deleteSingleHistory = async (scanId, domain) => {
    if (window.confirm(`Delete scan for "${domain}" from history?`)) {
      try {
        // YAHAN URL CHANGE KIYA - "delete/" add kiya
        await axios.delete(`/api/history/${scanId}/delete/`);
        setHistory(history.filter((item) => item.id !== scanId));
        fetchStats();
        alert(`Scan for "${domain}" deleted successfully!`);
      } catch (err) {
        console.error("Failed to delete scan", err);
        alert("Failed to delete scan");
      }
    }
  };

  // Clear all history
  const clearAllHistory = async () => {
    if (
      window.confirm(
        "⚠️ Are you sure you want to clear ALL scan history? This cannot be undone!",
      )
    ) {
      try {
        await axios.delete("/api/clear-history/");
        setHistory([]);
        fetchStats();
        alert("All history cleared successfully!");
      } catch (err) {
        console.error("Failed to clear history", err);
        alert("Failed to clear history");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Modern Header */}
      <header className="bg-gradient-to-r from-blue-900 via-purple-900 to-indigo-900 text-white shadow-2xl">
        <div className="container mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold flex items-center gap-3">
                <span className="text-5xl">🛡️</span>
                DNS Security Auditor
              </h1>
              <p className="text-blue-200 mt-2">
                Advanced DNS Security Scanner & Vulnerability Detector
              </p>
            </div>
            {stats && (
              <div className="flex gap-4 mt-4 md:mt-0">
                <div className="bg-white/10 rounded-lg px-4 py-2 text-center backdrop-blur-sm">
                  <div className="text-2xl font-bold">{stats.total_scans}</div>
                  <div className="text-xs text-blue-200">Total Scans</div>
                </div>
                <div className="bg-white/10 rounded-lg px-4 py-2 text-center backdrop-blur-sm">
                  <div className="text-2xl font-bold">
                    {stats.average_score}%
                  </div>
                  <div className="text-xs text-blue-200">Avg Score</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Modern Navigation Tabs */}
        <div className="flex flex-wrap gap-2 mb-8 border-b border-gray-200">
          <button
            onClick={() => setActiveTab("scan")}
            className={`px-6 py-3 font-semibold rounded-t-lg transition-all duration-200 flex items-center gap-2 ${
              activeTab === "scan"
                ? "bg-white text-blue-600 border-b-2 border-blue-600 shadow-sm"
                : "text-gray-600 hover:text-blue-600 hover:bg-gray-50"
            }`}
          >
            <span className="text-xl">🔍</span>
            New Security Scan
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`px-6 py-3 font-semibold rounded-t-lg transition-all duration-200 flex items-center gap-2 ${
              activeTab === "history"
                ? "bg-white text-blue-600 border-b-2 border-blue-600 shadow-sm"
                : "text-gray-600 hover:text-blue-600 hover:bg-gray-50"
            }`}
          >
            <span className="text-xl">📜</span>
            Scan History
            {history.length > 0 && (
              <span className="ml-2 bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full text-xs">
                {history.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("insights")}
            className={`px-6 py-3 font-semibold rounded-t-lg transition-all duration-200 flex items-center gap-2 ${
              activeTab === "insights"
                ? "bg-white text-blue-600 border-b-2 border-blue-600 shadow-sm"
                : "text-gray-600 hover:text-blue-600 hover:bg-gray-50"
            }`}
          >
            <span className="text-xl">📊</span>
            Security Insights
          </button>
        </div>

        {/* Scan Tab */}
        {activeTab === "scan" && (
          <div className="space-y-6">
            {/* Modern Scan Card */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <span>🚀</span> Domain Security Scanner
                </h2>
              </div>
              <div className="p-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Enter Domain Name
                    </label>
                    <input
                      type="text"
                      value={domain}
                      onChange={(e) => setDomain(e.target.value)}
                      placeholder="e.g., google.com, github.com, example.com"
                      className="w-full px-5 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                      onKeyPress={(e) =>
                        e.key === "Enter" && startAdvancedScan()
                      }
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      onClick={startAdvancedScan}
                      disabled={scanning || !domain}
                      className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold flex items-center gap-2 shadow-lg"
                    >
                      {scanning ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          Scanning...
                        </>
                      ) : (
                        <>
                          <span>🔍</span>
                          Start Scan
                        </>
                      )}
                    </button>
                  </div>
                </div>
                {error && (
                  <div className="mt-4 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg">
                    <div className="flex items-center gap-2">
                      <span>❌</span>
                      <span>{error}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Scan Results - Modern Design */}
            {scanResults && (
              <div className="space-y-6 animate-fadeIn">
                {/* Score Card - Modern */}
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                  <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-6 py-4">
                    <div className="flex flex-col md:flex-row justify-between items-center">
                      <div>
                        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                          <span>🎯</span>
                          {scanResults.domain}
                        </h2>
                        <p className="text-gray-400 mt-1">
                          Security Assessment Report
                        </p>
                        {scanResults.audit_id && (
                          <p className="text-xs text-gray-500 mt-1">
                            Audit ID: #{scanResults.audit_id}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-6 mt-4 md:mt-0">
                        <CircularProgress score={scanResults.security_score} />
                        <div className="text-center">
                          <div
                            className="text-5xl font-bold"
                            style={{ color: getGradeColor(scanResults.grade) }}
                          >
                            {scanResults.grade}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            Security Grade
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Export Buttons */}
                  <div className="px-6 py-4 bg-gray-50 border-b flex flex-wrap gap-3">
                    <button
                      onClick={() =>
                        exportToPDF(scanResults.audit_id, scanResults.domain)
                      }
                      disabled={exporting}
                      className="px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all flex items-center gap-2 shadow-md"
                    >
                      {exporting ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      ) : (
                        <span>📄</span>
                      )}
                      Export PDF Report
                    </button>
                    <button
                      onClick={exportToJSON}
                      className="px-5 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all flex items-center gap-2 shadow-md"
                    >
                      <span>📊</span>
                      Export JSON
                    </button>
                  </div>
                </div>

                {/* Email Security Section - Collapsible */}
                {scanResults.email_security && (
                  <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                    <button
                      onClick={() => toggleSection("email")}
                      className="w-full px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 flex justify-between items-center hover:from-blue-100 hover:to-indigo-100 transition"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">📧</span>
                        <h3 className="text-lg font-bold text-gray-800">
                          Email Security Analysis
                        </h3>
                      </div>
                      <span className="text-2xl">
                        {expandedSections.email ? "▼" : "▶"}
                      </span>
                    </button>
                    {expandedSections.email && (
                      <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          {Object.entries(scanResults.email_security).map(
                            ([key, value]) => {
                              const severity = getSeverityColor(value.risk);
                              return (
                                <div
                                  key={key}
                                  className="border rounded-xl p-4 hover:shadow-lg transition"
                                >
                                  <div className="flex items-center justify-between mb-3">
                                    <div className="font-bold text-gray-700 capitalize flex items-center gap-2">
                                      <span>{severity.icon}</span>
                                      {key.toUpperCase()}
                                    </div>
                                    <span
                                      className={`px-3 py-1 rounded-full text-xs font-bold`}
                                      style={{
                                        backgroundColor: severity.bg,
                                        color: severity.text,
                                      }}
                                    >
                                      {value.status.toUpperCase()}
                                    </span>
                                  </div>
                                  <p className="text-sm text-gray-600">
                                    {value.details}
                                  </p>
                                </div>
                              );
                            },
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Infrastructure Security Section */}
                {scanResults.infrastructure && (
                  <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                    <button
                      onClick={() => toggleSection("infrastructure")}
                      className="w-full px-6 py-4 bg-gradient-to-r from-green-50 to-emerald-50 flex justify-between items-center hover:from-green-100 hover:to-emerald-100 transition"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">🔒</span>
                        <h3 className="text-lg font-bold text-gray-800">
                          Infrastructure Security
                        </h3>
                      </div>
                      <span className="text-2xl">
                        {expandedSections.infrastructure ? "▼" : "▶"}
                      </span>
                    </button>
                    {expandedSections.infrastructure && (
                      <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {Object.entries(scanResults.infrastructure).map(
                            ([key, value]) => {
                              const severity = getSeverityColor(value.risk);
                              return (
                                <div
                                  key={key}
                                  className="bg-gray-50 rounded-xl p-4 border-l-4"
                                  style={{ borderLeftColor: severity.bg }}
                                >
                                  <div className="flex items-center justify-between mb-2">
                                    <div className="font-semibold text-gray-700 capitalize flex items-center gap-2">
                                      <span>{severity.icon}</span>
                                      {key.replace("_", " ")}
                                    </div>
                                    <span
                                      className={`px-2 py-1 rounded text-xs font-bold`}
                                      style={{
                                        backgroundColor: severity.bg,
                                        color: severity.text,
                                      }}
                                    >
                                      {value.status.toUpperCase()}
                                    </span>
                                  </div>
                                  <p className="text-xs text-gray-500 mt-1">
                                    {value.details}
                                  </p>
                                </div>
                              );
                            },
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* DNS Records Section */}
                {scanResults.records &&
                  Object.keys(scanResults.records).length > 0 && (
                    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                      <button
                        onClick={() => toggleSection("records")}
                        className="w-full px-6 py-4 bg-gradient-to-r from-purple-50 to-pink-50 flex justify-between items-center hover:from-purple-100 hover:to-pink-100 transition"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">📋</span>
                          <h3 className="text-lg font-bold text-gray-800">
                            DNS Records
                          </h3>
                          <span className="text-xs bg-gray-200 px-2 py-1 rounded-full">
                            {Object.keys(scanResults.records).length} types
                          </span>
                        </div>
                        <span className="text-2xl">
                          {expandedSections.records ? "▼" : "▶"}
                        </span>
                      </button>
                      {expandedSections.records && (
                        <div className="p-6">
                          <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">
                                    Record Type
                                  </th>
                                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">
                                    Value
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-200">
                                {Object.entries(scanResults.records).map(
                                  ([type, records]) =>
                                    records &&
                                    records.length > 0 &&
                                    records.slice(0, 5).map((record, idx) => (
                                      <tr
                                        key={`${type}-${idx}`}
                                        className="hover:bg-gray-50 transition"
                                      >
                                        <td className="px-4 py-2 text-sm font-mono font-semibold text-blue-600">
                                          {type}
                                        </td>
                                        <td className="px-4 py-2 text-sm text-gray-600 break-all font-mono">
                                          {record}
                                        </td>
                                      </tr>
                                    )),
                                )}
                              </tbody>
                            </table>
                            {Object.values(scanResults.records).some(
                              (r) => r && r.length > 5,
                            ) && (
                              <p className="text-xs text-gray-400 mt-3 text-center">
                                Showing first 5 records per type
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
              </div>
            )}
          </div>
        )}

        {/* History Tab - Modern Design */}
        {/* {activeTab === "history" && (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-6 py-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span>📜</span>
                Scan History
              </h2>
            </div>
            <div className="p-6">
              {history && history.length > 0 ? (
                <div className="space-y-3">
                  {history.map((scan, idx) => (
                    <div
                      key={idx}
                      className="group flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-gray-50 rounded-xl hover:shadow-lg transition-all duration-200 border border-transparent hover:border-blue-200"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-800">
                            {scan.domain}
                          </span>
                          <span className="text-xs text-gray-400">
                            #{scan.id}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {new Date(scan.created_at).toLocaleString()}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-3 mt-3 sm:mt-0">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all"
                              style={{
                                width: `${scan.security_score}%`,
                                backgroundColor: getScoreColor(
                                  scan.security_score,
                                ),
                              }}
                            ></div>
                          </div>
                          <span
                            className={`font-bold text-sm`}
                            style={{
                              color: getScoreColor(scan.security_score),
                            }}
                          >
                            {scan.security_score}
                          </span>
                        </div>
                        <span
                          className="px-2 py-1 rounded-lg text-xs font-bold"
                          style={{
                            backgroundColor: getScoreBgColor(
                              scan.security_score,
                            ),
                            color: getScoreColor(scan.security_score),
                          }}
                        >
                          Grade {scan.grade}
                        </span>
                        <button
                          onClick={() => exportToPDF(scan.id, scan.domain)}
                          className="px-3 py-1 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition flex items-center gap-1"
                        >
                          <span>📄</span> PDF
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🔍</div>
                  <p className="text-gray-500 font-medium">No scans yet</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Go to "New Security Scan" to start auditing domains
                  </p>
                </div>
              )}
            </div>
          </div>
        )} */}
        {activeTab === "history" && (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-6 py-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <span>📜</span>
                  Scan History
                  {history.length > 0 && (
                    <span className="text-sm bg-white/20 px-2 py-1 rounded-full">
                      {history.length} scans
                    </span>
                  )}
                </h2>
                {history.length > 0 && (
                  <button
                    onClick={clearAllHistory}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all flex items-center gap-2 text-sm"
                  >
                    <span>🗑️</span>
                    Clear All
                  </button>
                )}
              </div>
            </div>
            <div className="p-6">
              {history && history.length > 0 ? (
                <div className="space-y-3">
                  {history.map((scan, idx) => (
                    <div
                      key={idx}
                      className="group flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-gray-50 rounded-xl hover:shadow-lg transition-all duration-200 border border-transparent hover:border-blue-200"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-800">
                            {scan.domain}
                          </span>
                          <span className="text-xs text-gray-400">
                            #{scan.id}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {new Date(scan.created_at).toLocaleString()}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-3 mt-3 sm:mt-0">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all"
                              style={{
                                width: `${scan.security_score}%`,
                                backgroundColor: getScoreColor(
                                  scan.security_score,
                                ),
                              }}
                            ></div>
                          </div>
                          <span
                            className={`font-bold text-sm`}
                            style={{
                              color: getScoreColor(scan.security_score),
                            }}
                          >
                            {scan.security_score}
                          </span>
                        </div>
                        <span
                          className="px-2 py-1 rounded-lg text-xs font-bold"
                          style={{
                            backgroundColor: getScoreBgColor(
                              scan.security_score,
                            ),
                            color: getScoreColor(scan.security_score),
                          }}
                        >
                          Grade {scan.grade}
                        </span>
                        <button
                          onClick={() => exportToPDF(scan.id, scan.domain)}
                          className="px-3 py-1 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition flex items-center gap-1"
                        >
                          <span>📄</span> PDF
                        </button>
                        <button
                          onClick={() =>
                            deleteSingleHistory(scan.id, scan.domain)
                          }
                          className="px-3 py-1 bg-gray-500 text-white rounded-lg text-sm hover:bg-gray-600 transition flex items-center gap-1"
                        >
                          <span>❌</span> Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🔍</div>
                  <p className="text-gray-500 font-medium">No scans yet</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Go to "New Security Scan" to start auditing domains
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Insights Tab - New */}
        {activeTab === "insights" && stats && (
          <div className="space-y-6">
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-xl">
                <div className="text-4xl mb-2">📊</div>
                <div className="text-3xl font-bold">{stats.total_scans}</div>
                <div className="text-sm opacity-90">Total Security Scans</div>
              </div>
              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-xl">
                <div className="text-4xl mb-2">⭐</div>
                <div className="text-3xl font-bold">{stats.average_score}%</div>
                <div className="text-sm opacity-90">Average Security Score</div>
              </div>
              <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl p-6 text-white shadow-xl">
                <div className="text-4xl mb-2">🚨</div>
                <div className="text-3xl font-bold">
                  {stats.critical_vulnerabilities}
                </div>
                <div className="text-sm opacity-90">
                  Critical Vulnerabilities
                </div>
              </div>
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-xl">
                <div className="text-4xl mb-2">✅</div>
                <div className="text-3xl font-bold">
                  {stats.completed_scans}
                </div>
                <div className="text-sm opacity-90">Completed Scans</div>
              </div>
            </div>

            {/* Security Tips */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span>💡</span> Security Best Practices
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-xl">
                  <span className="text-2xl">🔐</span>
                  <div>
                    <div className="font-semibold text-gray-800">
                      Enable DNSSEC
                    </div>
                    <p className="text-sm text-gray-600">
                      Protects against DNS spoofing and cache poisoning attacks
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-green-50 rounded-xl">
                  <span className="text-2xl">📧</span>
                  <div>
                    <div className="font-semibold text-gray-800">
                      Implement DMARC
                    </div>
                    <p className="text-sm text-gray-600">
                      Prevents email spoofing and phishing attacks
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-xl">
                  <span className="text-2xl">🛡️</span>
                  <div>
                    <div className="font-semibold text-gray-800">
                      Use SPF -all
                    </div>
                    <p className="text-sm text-gray-600">
                      Strict SPF policy to prevent unauthorized email sending
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-xl">
                  <span className="text-2xl">🔒</span>
                  <div>
                    <div className="font-semibold text-gray-800">
                      Regular Security Audits
                    </div>
                    <p className="text-sm text-gray-600">
                      Monthly DNS security checks recommended
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-400 mt-12 py-6">
        <div className="container mx-auto px-6 text-center">
          <p>
            🛡️ DNS Security Auditor Tool | Secure your domain infrastructure
          </p>
          <p className="text-sm mt-2">
            Professional DNS Security Scanner & Vulnerability Detector
          </p>
        </div>
      </footer>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
