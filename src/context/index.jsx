import React, { createContext, useContext, useState, useCallback } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { db } from "../utils/dbConfig";
import { Users, Records } from "../utils/schema";
import { eq } from "drizzle-orm";

// Create context
const StateContext = createContext();

// Provider component
export const StateContextProvider = ({ children }) => {
  const { user, authenticated, ready, login, logout } = usePrivy();

  const [users, setUsers] = useState([]);
  const [records, setRecords] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  // Fetch all users
  const fetchUsers = useCallback(async () => {
    try {
      const result = await db.select().from(Users).execute();
      setUsers(result);
      return result;
    } catch (error) {
      console.error("Error fetching users:", error);
      return [];
    }
  }, []);

  // Fetch user by email
  const fetchUserByEmail = useCallback(async (email) => {
    if (!email) return null;
    try {
      const result = await db
        .select()
        .from(Users)
        .where(eq(Users.createdBy, email))
        .execute();
      if (result.length > 0) {
        setCurrentUser(result[0]);
        return result[0];
      }
      return null;
    } catch (error) {
      console.error("Error fetching user by email:", error);
      return null;
    }
  }, []);

  // Create a new user
  const createUser = useCallback(async (userData) => {
    try {
      const newUser = await db
        .insert(Users)
        .values(userData)
        .returning({ id: Users.id, createdBy: Users.createdBy })
        .execute();
      setUsers((prev) => [...prev, newUser[0]]);
      setCurrentUser(newUser[0]);
      return newUser[0];
    } catch (error) {
      console.error("Error creating user:", error);
      return null;
    }
  }, []);

  // Fetch all records for a user
  const fetchUserRecords = useCallback(async (userEmail) => {
    if (!userEmail) return [];
    try {
      const result = await db
        .select()
        .from(Records)
        .where(eq(Records.createdBy, userEmail))
        .execute();
      setRecords(result);
      return result;
    } catch (error) {
      console.error("Error fetching user records:", error);
      return [];
    }
  }, []);

  // Create a new record
  const createRecord = useCallback(async (recordData) => {
    try {
      const newRecord = await db
        .insert(Records)
        .values(recordData)
        .returning({ id: Records.id })
        .execute();
      setRecords((prev) => [...prev, newRecord[0]]);
      return newRecord[0];
    } catch (error) {
      console.error("Error creating record:", error);
      return null;
    }
  }, []);

  // Update an existing record
  const updateRecord = useCallback(async (recordData) => {
    try {
      const { documentID, ...dataToUpdate } = recordData;
      const updatedRecords = await db
        .update(Records)
        .set(dataToUpdate)
        .where(eq(Records.id, documentID))
        .returning()
        .execute();
      // Update local state
      setRecords((prev) =>
        prev.map((r) => (r.id === documentID ? { ...r, ...dataToUpdate } : r))
      );
      return updatedRecords[0];
    } catch (error) {
      console.error("Error updating record:", error);
      return null;
    }
  }, []);

  return (
    <StateContext.Provider
      value={{
        // Privy auth state — exposed so App.jsx can use them
        user,
        authenticated,
        ready,
        login,
        logout,
        // DB state
        users,
        records,
        currentUser,
        setCurrentUser,
        // DB actions
        fetchUsers,
        fetchUserByEmail,
        createUser,
        fetchUserRecords,
        createRecord,
        updateRecord,
      }}
    >
      {children}
    </StateContext.Provider>
  );
};

// Custom hook
export const useStateContext = () => useContext(StateContext);
