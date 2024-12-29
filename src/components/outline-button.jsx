"use client";
import React from "react";

function OutlineButton({ text, onClick, bgColor = "bg-white" }) {
  const textColor = bgColor === "bg-white" ? "text-black" : "text-white";

  return (
    <button
      className={`px-8 py-2 rounded-full border border-current ${textColor} font-inter bg-transparent hover:bg-opacity-10 transition-colors duration-300 w-[240px] h-[60px]`}
      onClick={onClick}
    >
      {text}
    </button>
  );
}

function OutlineButtonStory() {
  return (
    <div className="p-4 flex flex-col space-y-4 justify-center items-center h-screen bg-gray-100">
      <OutlineButton text="Click me" onClick={() => alert("Button clicked!")} />
      <OutlineButton
        text="Dark version"
        onClick={() => alert("Dark button clicked!")}
        bgColor="bg-black"
      />
    </div>
  );
}

export default OutlineButton;