import React, { useEffect } from "react";
import { useStateContext } from "../context";
import { usePrivy } from "@privy-io/react-auth";

const Profile = () => {
  const { currentUser, fetchUserByEmail } = useStateContext();
  const { user } = usePrivy();

  useEffect(() => {
    if (!currentUser) {
      fetchUserByEmail(user?.email?.address);
    }
  }, [currentUser, fetchUserByEmail, user]);

  if (!currentUser) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-lg text-blue-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="mx-auto mt-16 max-w-lg rounded-lg bg-white p-6 shadow-lg border border-gray-200">
      <div className="flex flex-col items-center">
        <p className="mb-4 flex h-20 w-20 flex-row items-center justify-center rounded-full bg-blue-500">
          <span className="text-6xl text-white">😊</span>
        </p>
        <h1 className="mb-2 text-3xl font-semibold text-blue-900">User Profile</h1>
        <div className="mt-4 w-full">
          <p className="mb-1 text-sm text-gray-600">Email:</p>
          <p className="mb-4 text-lg font-semibold text-blue-900">
            {currentUser.createdBy}
          </p>

          <p className="mb-1 text-sm text-gray-600">Username:</p>
          <p className="mb-4 text-lg font-semibold text-blue-900">
            {currentUser.username}
          </p>

          <p className="mb-1 text-sm text-gray-600">Age:</p>
          <p className="mb-4 text-lg font-semibold text-blue-900">
            {currentUser.age}
          </p>

          <p className="mb-1 text-sm text-gray-600">Location:</p>
          <p className="text-lg font-semibold text-blue-900">
            {currentUser.location}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Profile;
