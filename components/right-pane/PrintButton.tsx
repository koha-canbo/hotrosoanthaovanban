"use client";

import React from "react";
import { Printer } from "lucide-react";

export default function PrintButton() {
  const handlePrint = () => {
    window.print();
  };

  return (
    <button
      className="btn-secondary"
      onClick={handlePrint}
      title="In văn bản"
    >
      <Printer size={14} />
      In
    </button>
  );
}
