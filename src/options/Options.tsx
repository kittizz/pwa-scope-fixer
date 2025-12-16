import React, { useEffect, useState } from "react";
import "./index.css";
import { StorageManager } from "../utils/storage";

import logo from "../icons/icon16.png";

export function Options() {
  const [autoScopeFix, setAutoScopeFix] = useState(true);
  const [status, setStatus] = useState("");

  useEffect(() => {
    StorageManager.get("autoScopeFix").then(({ autoScopeFix }) => {
      setAutoScopeFix(autoScopeFix);
    });
  }, []);

  const handleSave = async () => {
    try {
      await StorageManager.set({ autoScopeFix });
      setStatus("Settings saved!");
      setTimeout(() => setStatus(""), 2000);
    } catch (e) {
      console.error(e);
      setStatus("Error saving settings");
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-8 text-center relative z-10">
      <div className="flex justify-center items-center gap-8 mb-8">
        <img
          src={logo}
          alt="Bun Logo"
          className="h-24 p-6 transition-all duration-300 hover:drop-shadow-[0_0_2em_#646cffaa]"
        />
      </div>

      <h1 className="text-4xl font-bold my-4">Extension Options</h1>
      <div className="text-left max-w-md mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <h2 className="text-xl font-bold mb-4">Settings</h2>
        <div className="mb-4">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              className="form-checkbox w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
              checked={autoScopeFix}
              onChange={(e) => setAutoScopeFix(e.target.checked)}
            />
            <span className="text-gray-700 dark:text-gray-300">Enable Auto Scope Fix</span>
          </label>
          <p className="text-sm text-gray-500 mt-1 ml-7">
            Automatically inject corrected manifest for previously fixed sites.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            onClick={handleSave}
          >
            Save
          </button>
          {status && <span className="text-green-600 font-medium">{status}</span>}
        </div>
      </div>
    </div>
  );
}

export default Options;
