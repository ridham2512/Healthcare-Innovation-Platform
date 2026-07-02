import React from "react";
import { IconFolderOpen } from "@tabler/icons-react";

const RecordDetailsHeader = ({ recordName }) => {
  return (
    <div className="grid w-full gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
      <div className="flex flex-col rounded-xl border border-gray-300 bg-white shadow-md">
        <div className="flex justify-between gap-x-3 p-4 md:p-5">
          <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-gray-200">
            <IconFolderOpen size={40} className="text-blue-600" />
          </div>
        </div>
        <a
          className="inline-flex items-center justify-between rounded-b-xl border-t border-gray-200 px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 transition duration-200 md:px-5"
          href="#"
        >
          {recordName}
        </a>
      </div>
    </div>
  );
};

export default RecordDetailsHeader;
