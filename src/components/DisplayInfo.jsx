import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  IconAlertCircle,
  IconCircleDashedCheck,
  IconFolder,
  IconHourglassHigh,
  IconUserScan,
} from "@tabler/icons-react";
import MetricsCard from "./MetricsCard";
import { useStateContext } from "../context";

const DisplayInfo = () => {
  const navigate = useNavigate();
  const { user, fetchUserRecords, fetchUserByEmail, records } = useStateContext();
  const [metrics, setMetrics] = useState({
    totalFolders: 0,
    aiPersonalizedTreatment: 0,
    totalScreenings: 0,
    completedScreenings: 0,
    pendingScreenings: 0,
    overdueScreenings: 0,
  });

  // Fetch user data on mount
  useEffect(() => {
    const loadData = async () => {
      if (!user?.email?.address) return;
      await fetchUserByEmail(user.email.address);
      await fetchUserRecords(user.email.address);
    };
    loadData();
  }, [user, fetchUserByEmail, fetchUserRecords]);

  // Recalculate metrics whenever records change
  useEffect(() => {
    if (!records || records.length === 0) {
      setMetrics({
        totalFolders: 0,
        aiPersonalizedTreatment: 0,
        totalScreenings: 0,
        completedScreenings: 0,
        pendingScreenings: 0,
        overdueScreenings: 0,
      });
      return;
    }

    const totalFolders = records.length;
    let aiPersonalizedTreatment = 0;
    let totalScreenings = 0;
    let completedScreenings = 0;
    let pendingScreenings = 0;
    let overdueScreenings = 0;

    records.forEach((record) => {
      if (record.kanbanRecords) {
        try {
          const kanban = JSON.parse(record.kanbanRecords);
          if (kanban?.columns) {
            aiPersonalizedTreatment += kanban.columns.some(
              (col) => col.title === "AI Personalized Treatment"
            )
              ? 1
              : 0;
          }
          if (kanban?.tasks) {
            totalScreenings += kanban.tasks.length;
            completedScreenings += kanban.tasks.filter(
              (t) => t.columnId === "done"
            ).length;
            pendingScreenings += kanban.tasks.filter(
              (t) => t.columnId === "doing"
            ).length;
            overdueScreenings += kanban.tasks.filter(
              (t) => t.columnId === "overdue"
            ).length;
          }
        } catch {
          // Skip malformed kanban records
        }
      }
    });

    setMetrics({
      totalFolders,
      aiPersonalizedTreatment,
      totalScreenings,
      completedScreenings,
      pendingScreenings,
      overdueScreenings,
    });
  }, [records]);

  const metricsData = [
    {
      title: "Treatment Progress",
      subtitle: "View Kanban Board",
      value: `${metrics.completedScreenings} / ${metrics.totalScreenings}`,
      icon: IconCircleDashedCheck,
      onClick: () => navigate("/screening-schedules"),
    },
    {
      title: "Pending Tasks",
      subtitle: "View Schedules",
      value: metrics.pendingScreenings,
      icon: IconHourglassHigh,
      onClick: () => navigate("/screening-schedules"),
    },
    {
      title: "Medical Records",
      subtitle: "View Records",
      value: metrics.totalFolders,
      icon: IconFolder,
      onClick: () => navigate("/medical-records"),
    },
    {
      title: "Total Screenings",
      subtitle: "View All",
      value: metrics.totalScreenings,
      icon: IconUserScan,
      onClick: () => navigate("/screening-schedules"),
    },
    {
      title: "Completed Screenings",
      subtitle: "View Completed",
      value: metrics.completedScreenings,
      icon: IconCircleDashedCheck,
      onClick: () => navigate("/screening-schedules"),
    },
    {
      title: "In Progress",
      subtitle: "View In Progress",
      value: metrics.pendingScreenings,
      icon: IconHourglassHigh,
      onClick: () => navigate("/screening-schedules"),
    },
    {
      title: "Overdue Screenings",
      subtitle: "View Overdue",
      value: metrics.overdueScreenings,
      icon: IconAlertCircle,
      onClick: () => navigate("/screening-schedules"),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Welcome banner */}
      <div className="rounded-2xl bg-gradient-to-r from-blue-600 to-green-500 p-6 text-white shadow-lg">
        <h1 className="text-2xl font-bold">
          Welcome back{user?.email?.address ? `, ${user.email.address.split("@")[0]}` : ""}! 👋
        </h1>
        <p className="mt-1 text-blue-100 text-sm">
          Here's an overview of your health management dashboard.
        </p>
      </div>

      {/* Top 2 metrics */}
      <div className="grid w-full gap-4 sm:grid-cols-2">
        {metricsData.slice(0, 2).map((metric) => (
          <MetricsCard key={metric.title} {...metric} />
        ))}
      </div>

      {/* Bottom metrics grid */}
      <div className="grid w-full gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metricsData.slice(2).map((metric) => (
          <MetricsCard key={metric.title} {...metric} />
        ))}
      </div>
    </div>
  );
};

export default DisplayInfo;
