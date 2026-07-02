import React, { useEffect } from "react";
import { Route, Routes, useNavigate } from "react-router-dom";
import { Sidebar, Navbar } from "./components";
import { Home, Profile, Onboarding } from "./pages";
import MedicalRecords from "./pages/records/index";
import ScreeningSchedule from "./pages/ScreeningSchedule";
import SingleRecordDetails from "./pages/records/single-record-details";
import Landing from "./Landing";
import { useStateContext } from "./context";

const App = () => {
  const { user, authenticated, ready, login, currentUser, fetchUserByEmail } =
    useStateContext();
  const navigate = useNavigate();

  // Redirect to login if Privy is ready but user is not authenticated
  useEffect(() => {
    if (ready && !authenticated) {
      // Show landing page — login happens when user clicks the button
    }
  }, [ready, authenticated, login]);

  // Fetch current user profile from DB once authenticated
  useEffect(() => {
    if (authenticated && user?.email?.address) {
      fetchUserByEmail(user.email.address);
    }
  }, [authenticated, user, fetchUserByEmail]);

  // Redirect to onboarding if authenticated but no profile yet
  useEffect(() => {
    if (ready && authenticated && user && currentUser === null) {
      const timer = setTimeout(() => {
        if (currentUser === null) {
          navigate("/onboarding");
        }
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [ready, authenticated, user, currentUser, navigate]);

  // Show loading spinner while Privy initializes
  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
          <p className="text-sm font-medium text-gray-500">Loading CureCloud…</p>
        </div>
      </div>
    );
  }

  // Show landing page if not authenticated
  if (!authenticated) {
    return (
      <Routes>
        <Route path="*" element={<Landing />} />
      </Routes>
    );
  }

  // Show onboarding if no profile
  if (authenticated && !currentUser) {
    return (
      <Routes>
        <Route path="*" element={<Onboarding />} />
      </Routes>
    );
  }

  // Main app layout (authenticated + profile exists)
  return (
    <div className="relative flex min-h-screen flex-row bg-slate-50 p-4 sm:p-6">
      <div className="relative mr-6 hidden sm:flex">
        <Sidebar />
      </div>

      <div className="mx-auto max-w-[1280px] flex-1 max-sm:w-full">
        <Navbar />

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/medical-records" element={<MedicalRecords />} />
          <Route
            path="/medical-records/:id"
            element={<SingleRecordDetails />}
          />
          <Route path="/screening-schedules" element={<ScreeningSchedule />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </div>
    </div>
  );
};

export default App;
