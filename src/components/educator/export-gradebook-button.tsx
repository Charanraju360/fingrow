"use client";

import React, { useState } from "react";
import { Download, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface GradebookRow {
  studentName: string;
  studentEmail: string;
  completedCount: number;
  averageScore: number | string;
  lastActive: string;
  status: string;
}

interface ExportGradebookButtonProps {
  classroomId: string;
  classroomName: string;
  rows: GradebookRow[];
}

export function ExportGradebookButton({
  classroomId,
  classroomName,
  rows,
}: ExportGradebookButtonProps) {
  const [downloaded, setDownloaded] = useState(false);

  function handleExportCSV() {
    const headers = "Student Name,Email,Completed Quizzes,Average Quiz Score (%),Last Active Date,Status\n";
    const csvContent = rows
      .map(
        (r) =>
          `"${(r.studentName || "").replace(/"/g, '""')}","${(r.studentEmail || "").replace(/"/g, '""')}",${r.completedCount},${r.averageScore},"${(r.lastActive || "").replace(/"/g, '""')}","${(r.status || "").replace(/"/g, '""')}"`
      )
      .join("\n");

    const blob = new Blob([headers + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const safeName = (classroomName || "Classroom").replace(/[^a-zA-Z0-9_-]/g, "_");
    link.setAttribute("href", url);
    link.setAttribute("download", `FinGrow_Gradebook_${safeName}_${classroomId}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2500);
  }

  return (
    <Button
      size="sm"
      variant={downloaded ? "secondary" : "primary"}
      onClick={handleExportCSV}
      disabled={rows.length === 0}
      title="Download classroom gradebook as CSV"
      aria-label="Export CSV Gradebook"
    >
      {downloaded ? (
        <>
          <Check className="w-4 h-4 mr-1.5 text-fingrow-emerald" />
          <span>CSV Downloaded!</span>
        </>
      ) : (
        <>
          <Download className="w-4 h-4 mr-1.5" />
          <span>Export CSV Gradebook</span>
        </>
      )}
    </Button>
  );
}
