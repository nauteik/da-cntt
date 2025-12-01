import { useState } from "react";
import { pdf } from "@react-pdf/renderer";
import SchedulePdfDocument from "@/components/schedule/SchedulePdfDocument";
import type { ScheduleEventDTO } from "@/types/schedule";

export const useScheduleExport = () => {
  const [isExporting, setIsExporting] = useState(false);

  const exportPdf = async (events: ScheduleEventDTO[], title: string) => {
    if (!events || events.length === 0) {
      throw new Error("No events to export");
    }

    setIsExporting(true);
    
    try {
      // Generate PDF blob
      const blob = await pdf(
        SchedulePdfDocument({ events, title })
      ).toBlob();

      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const timestamp = new Date().toISOString().split("T")[0];
      link.href = url;
      link.download = `schedule-export-${timestamp}.pdf`;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      return true;
    } catch (error) {
      console.error("Error exporting PDF:", error);
      throw error;
    } finally {
      setIsExporting(false);
    }
  };

  return { exportPdf, isExporting };
};

