"use client";
import React from "react";
import { useState, useCallback } from 'react';
import { useUpload } from '@create-labs/shared';

import { useUpload } from "../utilities/runtime-helpers";

function MainComponent() {
  const [jsonInput, setJsonInput] = useState("");
  const [csvOutput, setCsvOutput] = useState("");
  const [error, setError] = useState("");
  const [inputType, setInputType] = useState("text");
  const [upload, { loading: uploadLoading }] = useUpload();

  const [loading, setLoading] = useState(false);
  const [fileLoading, setFileLoading] = useState(false);
  const [urlLoading, setUrlLoading] = useState(false);
  const handleFileUpload = async (file) => {
    try {
      setFileLoading(true);
      setError("");
      const { url, error: uploadError } = await upload({ file });
      if (uploadError) throw new Error(uploadError);
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch file content");
      const text = await response.text();
      setJsonInput(text);
    } catch (err) {
      setError(err.message);
      setJsonInput("");
    } finally {
      setFileLoading(false);
    }
  };

  const handleUrlUpload = async (urlValue) => {
    try {
      setUrlLoading(true);
      setError("");
      const { url, error: uploadError } = await upload({ url: urlValue });
      if (uploadError) throw new Error(uploadError);
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch URL content");
      const text = await response.text();
      setJsonInput(text);
    } catch (err) {
      setError(err.message);
      setJsonInput("");
    } finally {
      setUrlLoading(false);
    }
  };
  
  const convertToCSV = useCallback(async () => {
    try {
      setLoading(true);
      const parsedJSON = JSON.parse(jsonInput);

      if (!Array.isArray(parsedJSON)) {
        throw new Error("Input must be an array of objects");
      }

      if (parsedJSON.length === 0) {
        throw new Error("Array cannot be empty");
      }

      const headers = Object.keys(parsedJSON[0]);
      const csvRows = [headers.join(",")];

      parsedJSON.forEach((item) => {
        const row = headers.map((header) => {
          const value = item[header];
          return typeof value === "string" ? `"${value}"` : value;
        });
        csvRows.push(row.join(","));
      });

      setCsvOutput(csvRows.join("\n"));
      setError("");
    } catch (err) {
      setError(err.message);
      setCsvOutput("");
    } finally {
      setLoading(false);
    }
  }, [jsonInput]);

  const downloadCSV = useCallback(() => {
    const blob = new Blob([csvOutput], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "converted.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  }, [csvOutput]);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-roboto font-bold text-gray-800">
          JSON to CSV Converter
        </h1>

        <div className="space-y-4">
          <div className="flex gap-4">
            <button
              onClick={() => setInputType("text")}
              className={`px-4 py-2 rounded-lg font-roboto ${
                inputType === "text"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              Text
            </button>
            <button
              onClick={() => setInputType("file")}
              className={`px-4 py-2 rounded-lg font-roboto ${
                inputType === "file"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              File
            </button>
            <button
              onClick={() => setInputType("url")}
              className={`px-4 py-2 rounded-lg font-roboto ${
                inputType === "url"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              URL
            </button>
          </div>

          {inputType === "text" && (
            <div>
              <label className="block font-roboto mb-2 text-gray-700">
                Input JSON (array of objects)
              </label>
              <textarea
                className="w-full h-[200px] p-4 border rounded-lg font-mono bg-white"
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                placeholder='[{"name": "John", "age": 30}, {"name": "Jane", "age": 25}]'
              />
            </div>
          )}

          {inputType === "file" && (
            <div>
              <label className="block font-roboto mb-2 text-gray-700">
                Upload JSON File
              </label>
              <input
                type="file"
                accept=".json"
                onChange={(e) => {
                  if (e.target.files) {
                    handleFileUpload(e.target.files[0]);
                  }
                }}
                className="w-full p-2 border rounded-lg font-roboto"
                disabled={fileLoading}
              />
              {fileLoading && (
                <div className="mt-2 text-blue-500 font-roboto">
                  Loading file...
                </div>
              )}
            </div>
          )}

          {inputType === "url" && (
            <div>
              <label className="block font-roboto mb-2 text-gray-700">
                JSON URL
              </label>
              <input
                type="url"
                placeholder="https://example.com/data.json"
                onChange={(e) => handleUrlUpload(e.target.value)}
                className="w-full p-2 border rounded-lg font-roboto"
                disabled={urlLoading}
              />
              {urlLoading && (
                <div className="mt-2 text-blue-500 font-roboto">
                  Loading URL...
                </div>
              )}
            </div>
          )}

          <button
            onClick={convertToCSV}
            disabled={loading || uploadLoading}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 font-roboto disabled:bg-blue-300"
          >
            {loading || uploadLoading ? "Loading..." : "Convert to CSV"}
          </button>

          {error && <div className="text-red-500 font-roboto">{error}</div>}

          {csvOutput && (
            <div className="space-y-4">
              <div>
                <label className="block font-roboto mb-2 text-gray-700">
                  CSV Output
                </label>
                <textarea
                  className="w-full h-[200px] p-4 border rounded-lg font-mono bg-white"
                  value={csvOutput}
                  readOnly
                />
              </div>

              <button
                onClick={downloadCSV}
                className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 font-roboto"
              >
                Download CSV
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MainComponent;
