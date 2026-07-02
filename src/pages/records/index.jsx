import React, { useState, useEffect } from "react";
import { IconCirclePlus } from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";
import { usePrivy } from "@privy-io/react-auth";
import { useStateContext } from "../../context/index";
import CreateRecordModal from "./components/create-record-modal";
import RecordCard from "./components/record-card";

const Index = () => {
  const navigate = useNavigate();
  const { user } = usePrivy();
  const {
    records,
    fetchUserRecords,
    createRecord,
    fetchUserByEmail,
    currentUser,
  } = useStateContext();

  const [userRecords, setUserRecords] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (user) {
      fetchUserByEmail(user.email.address);
      fetchUserRecords(user.email.address);
    }
  }, [user, fetchUserByEmail, fetchUserRecords]);

  useEffect(() => {
    setUserRecords(records);
    localStorage.setItem("userRecords", JSON.stringify(records));
  }, [records]);

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  const createFolder = async (foldername) => {
    try {
      if (currentUser) {
        const newRecord = await createRecord({
          userId: currentUser.id,
          recordName: foldername,
          analysisResult: "",
          kanbanRecords: "",
          createdBy: user.email.address,
        });

        if (newRecord) {
          fetchUserRecords(user.email.address);
          handleCloseModal();
        }
      }
    } catch (e) {
      console.error(e);
      handleCloseModal();
    }
  };

  const handleNavigate = (name) => {
    const filteredRecords = userRecords.find(
      (record) => record.recordName === name
    );
    navigate(`/medical-records/${name}`, { state: filteredRecords });
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <button
        type="button"
        className="self-start flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2 text-white shadow-md transition hover:bg-blue-700 focus:ring-2 focus:ring-blue-500"
        onClick={handleOpenModal}
      >
        <IconCirclePlus size={20} />
        Create Record
      </button>

      <CreateRecordModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onCreate={createFolder}
      />

      <div className="grid w-full gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {userRecords.length > 0 ? (
          userRecords.map((record) => (
            <RecordCard
              key={record.recordName}
              record={record}
              onNavigate={handleNavigate}
            />
          ))
        ) : (
          <p className="text-gray-600 text-center col-span-full">
            No records found. Click "Create Record" to add one.
          </p>
        )}
      </div>
    </div>
  );
};

export default Index;
