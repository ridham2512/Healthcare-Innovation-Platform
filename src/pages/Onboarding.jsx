import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStateContext } from "../context";

const Onboarding = () => {
  const { createUser, user } = useStateContext();
  const [username, setUsername] = useState("");
  const [age, setAge] = useState("");
  const [location, setLocation] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const userEmail = user?.email?.address;

  const handleOnboarding = async (e) => {
    e.preventDefault();
    setError("");

    if (!userEmail) {
      setError(
        "No email address found on your account. Please login with an email."
      );
      return;
    }

    if (!username.trim() || !age || !location.trim()) {
      setError("Please fill in all fields.");
      return;
    }

    const parsedAge = parseInt(age, 10);
    if (isNaN(parsedAge) || parsedAge < 1 || parsedAge > 120) {
      setError("Please enter a valid age.");
      return;
    }

    setLoading(true);
    try {
      const userData = {
        username: username.trim(),
        age: parsedAge,
        location: location.trim(),
        folders: [],
        treatmentCounts: 0,
        folder: [],
        createdBy: userEmail,
      };

      const newUser = await createUser(userData);
      if (newUser) {
        navigate("/");
      } else {
        setError("Failed to create your profile. Please try again.");
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-green-50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl border border-gray-100">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <span className="text-3xl">👋</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome to CureCloud!</h1>
          <p className="mt-2 text-sm text-gray-500">
            Let's set up your health profile to get started.
          </p>
          {userEmail && (
            <p className="mt-1 text-xs text-green-600 font-medium">{userEmail}</p>
          )}
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleOnboarding} className="space-y-5">
          <div>
            <label htmlFor="username" className="mb-1.5 block text-sm font-medium text-gray-700">
              Full Name
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              placeholder="John Doe"
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-800 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition"
            />
          </div>

          <div>
            <label htmlFor="age" className="mb-1.5 block text-sm font-medium text-gray-700">
              Age
            </label>
            <input
              id="age"
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              required
              min="1"
              max="120"
              placeholder="25"
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-800 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition"
            />
          </div>

          <div>
            <label htmlFor="location" className="mb-1.5 block text-sm font-medium text-gray-700">
              Location
            </label>
            <input
              id="location"
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
              placeholder="New York, USA"
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-800 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full rounded-xl bg-blue-600 py-3.5 text-sm font-semibold text-white shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-60 disabled:cursor-not-allowed transition"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Setting up your profile…
              </span>
            ) : (
              "Get Started →"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Onboarding;
