import React from "react";
import KanbanBoard from "../components/KanbanBoard";
import { useLocation } from "react-router-dom";

const ScreeningSchedule = () => {
  const location = useLocation();
  const state = location.state;

  return (
    <div className="w-full overflow-auto">
      {state ? (
        <KanbanBoard state={{ state }} />
      ) : (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="rounded-full bg-blue-100 p-5 mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-10 w-10 text-blue-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-700">No Treatment Plan Yet</h2>
          <p className="mt-2 text-sm text-gray-500 max-w-sm">
            Upload a medical report in your{" "}
            <a href="/medical-records" className="text-blue-500 underline">
              Medical Records
            </a>{" "}
            to generate an AI-powered treatment plan.
          </p>
        </div>
      )}
    </div>
  );
};

export default ScreeningSchedule;
