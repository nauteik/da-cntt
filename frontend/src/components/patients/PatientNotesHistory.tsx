"use client";

import React, { useState } from "react";
import { Card, Empty, Pagination, Tag, Divider, Image } from "antd";
import {
  CalendarOutlined,
  UserOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import { usePatientDailyNotes } from "@/hooks/usePatientDailyNotes";
import type { DailyNoteDTO, MealInfo } from "@/types/dailyNote";
import LoadingFallback from "@/components/common/LoadingFallback";
import InlineError from "@/components/common/InlineError";

interface PatientNotesHistoryProps {
  patientId: string;
}

export default function PatientNotesHistory({
  patientId,
}: PatientNotesHistoryProps) {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [selectedNote, setSelectedNote] = useState<DailyNoteDTO | null>(null);

  const { data, isLoading, error } = usePatientDailyNotes(
    patientId,
    page,
    pageSize
  );

  const handlePageChange = (newPage: number, newPageSize?: number) => {
    setPage(newPage - 1); // Ant Design uses 1-indexed, backend uses 0-indexed
    if (newPageSize && newPageSize !== pageSize) {
      setPageSize(newPageSize);
      setPage(0); // Reset to first page when page size changes
    }
  };

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "N/A";
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return "N/A";
    }
  };

  const calculateDuration = (checkIn?: string, checkOut?: string) => {
    if (!checkIn || !checkOut) return "N/A";
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffMs = end.getTime() - start.getTime();
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  if (isLoading) {
    return <LoadingFallback message="Loading daily notes..." />;
  }

  if (error) {
    return (
      <div className="p-6">
        <InlineError
          title="Error Loading Daily Notes"
          message={error.message || "Failed to load daily notes"}
        />
      </div>
    );
  }

  if (!data || data.content.length === 0) {
    return (
      <div className="p-6">
        <Empty
          description="No daily notes found for this patient"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-xl font-semibold text-[var(--text-primary)]">
            Daily Notes & History
          </h3>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            {data.totalElements} note{data.totalElements !== 1 ? "s" : ""} found
          </p>
        </div>
      </div>

      {/* Master-Detail Layout */}
      <div className="flex gap-6 h-[calc(100vh-250px)]">
        {/* Left Panel - List (40%) */}
        <div className="w-2/5 overflow-y-auto">
          <div className="space-y-3">
            {data.content.map((note) => (
              <Card
                key={note.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedNote?.id === note.id 
                    ? 'border-2 border-[var(--accent)] shadow-md' 
                    : ''
                }`}
                styles={{
                  body: { padding: "16px" },
                }}
                onClick={() => setSelectedNote(note)}
              >
                {/* Compact Note Info */}
                <div className="flex items-center gap-2 mb-2">
                  <CalendarOutlined className="text-[var(--accent)]" />
                  <span className="font-medium text-sm text-[var(--text-primary)]">
                    {formatDate(note.createdAt)}
                  </span>
                  {note.checkInTime && note.checkOutTime && (
                    <Tag color="green" icon={<CheckCircleOutlined />} className="text-xs">
                      Completed
                    </Tag>
                  )}
                </div>
                
                <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)] mb-2">
                  <UserOutlined />
                  <span>{note.staffName}</span>
                </div>
                
                <div className="text-xs text-[var(--text-primary)] line-clamp-2">
                  {note.content}
                </div>
                
                {/* Bottom Info */}
                <div className="flex gap-2 mt-2 flex-wrap">
                  {note.mealInfo && note.mealInfo.length > 0 && (
                    <Tag className="text-xs" color="default">
                      <FileTextOutlined /> {note.mealInfo.length} meal(s)
                    </Tag>
                  )}
                  {note.patientSignature && (
                    <Tag color="blue" className="text-xs">
                      Patient Signed
                    </Tag>
                  )}
                  {note.staffSignature && (
                    <Tag color="purple" className="text-xs">
                      Staff Signed
                    </Tag>
                  )}
                </div>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {data.totalPages > 1 && (
            <div className="flex justify-center mt-4">
              <Pagination
                current={page + 1}
                total={data.totalElements}
                pageSize={pageSize}
                onChange={handlePageChange}
                showSizeChanger={false}
                size="small"
                showTotal={(total) => `Total ${total}`}
              />
            </div>
          )}
        </div>

        {/* Right Panel - Detail (60%) */}
        <div className="w-3/5 overflow-y-auto border-l border-[var(--border)] pl-6">
          {selectedNote ? (
            <div>
              {/* Header */}
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-2">
                  <CalendarOutlined className="text-[var(--accent)] text-xl" />
                  <h4 className="text-lg font-semibold text-[var(--text-primary)]">
                    {formatDate(selectedNote.createdAt)}
                  </h4>
                  {selectedNote.checkInTime && selectedNote.checkOutTime && (
                    <Tag color="green" icon={<CheckCircleOutlined />}>
                      Completed
                    </Tag>
                  )}
                </div>
              </div>

              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <div className="text-xs text-[var(--text-secondary)] mb-1">
                    Staff Member
                  </div>
                  <div className="text-sm font-medium">
                    {selectedNote.staffName}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-[var(--text-secondary)] mb-1">
                    Date Created
                  </div>
                  <div className="text-sm font-medium">
                    {formatDate(selectedNote.createdAt)}
                  </div>
                </div>
                {selectedNote.checkInTime && (
                  <div>
                    <div className="text-xs text-[var(--text-secondary)] mb-1">
                      Check-In Time
                    </div>
                    <div className="text-sm font-medium">
                      {formatDateTime(selectedNote.checkInTime)}
                    </div>
                  </div>
                )}
                {selectedNote.checkOutTime && (
                  <div>
                    <div className="text-xs text-[var(--text-secondary)] mb-1">
                      Check-Out Time
                    </div>
                    <div className="text-sm font-medium">
                      {formatDateTime(selectedNote.checkOutTime)}
                    </div>
                  </div>
                )}
                {selectedNote.checkInTime && selectedNote.checkOutTime && (
                  <div>
                    <div className="text-xs text-[var(--text-secondary)] mb-1">
                      Duration
                    </div>
                    <div className="text-sm font-medium">
                      {calculateDuration(selectedNote.checkInTime, selectedNote.checkOutTime)}
                    </div>
                  </div>
                )}
              </div>

              <Divider />

              {/* Note Content */}
              <div className="mb-6">
                <div className="text-sm font-semibold text-[var(--text-primary)] mb-3">
                  Care Notes
                </div>
                <div className="text-sm text-[var(--text-primary)] whitespace-pre-wrap bg-[var(--bg-elevated)] p-4 rounded-lg">
                  {selectedNote.content}
                </div>
              </div>

              {/* Meal Information */}
              {selectedNote.mealInfo && selectedNote.mealInfo.length > 0 && (
                <>
                  <Divider />
                  <div className="mb-6">
                    <div className="text-sm font-semibold text-[var(--text-primary)] mb-3">
                      Meal Information
                    </div>
                    <div className="space-y-3">
                      {selectedNote.mealInfo.map((meal: MealInfo, index: number) => {
                        const mealData = typeof meal === 'string' ? JSON.parse(meal) : meal;
                        const mealName = mealData.meal || mealData.mealType || 'Meal ' + (index + 1);
                        const offered = mealData.offered || mealData.whatOffered;
                        const consumed = mealData.ate || mealData.whatHad;
                        const time = mealData.time;
                        const notes = mealData.notes;
                        const displayMealName = mealName.charAt(0).toUpperCase() + mealName.slice(1);
                        
                        return (
                          <div
                            key={index}
                            className="bg-[var(--bg-elevated)] p-4 rounded-lg"
                          >
                            <div className="flex justify-between items-start mb-2">
                              <span className="font-medium text-sm">
                                {displayMealName}
                              </span>
                              {time && (
                                <span className="text-xs text-[var(--text-secondary)]">
                                  {time}
                                </span>
                              )}
                            </div>
                            <div className="space-y-2">
                              {offered && (
                                <div className="text-xs">
                                  <span className="text-[var(--text-secondary)] font-medium">
                                    Offered:
                                  </span>
                                  <div className="text-[var(--text-primary)] mt-1">
                                    {offered}
                                  </div>
                                </div>
                              )}
                              {consumed && (
                                <div className="text-xs">
                                  <span className="text-[var(--text-secondary)] font-medium">
                                    Consumed:
                                  </span>
                                  <div className="text-[var(--text-primary)] mt-1">
                                    {consumed}
                                  </div>
                                </div>
                              )}
                            </div>
                            {notes && (
                              <div className="mt-2 text-xs">
                                <span className="text-[var(--text-secondary)] font-medium">
                                  Notes:
                                </span>
                                <div className="text-[var(--text-primary)] mt-1">
                                  {notes}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}

              {/* Signatures */}
              {(selectedNote.patientSignature || selectedNote.staffSignature) && (
                <>
                  <Divider />
                  <div>
                    <div className="text-sm font-semibold text-[var(--text-primary)] mb-3">
                      Signatures
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      {selectedNote.patientSignature && (
                        <div>
                          <div className="text-xs text-[var(--text-secondary)] mb-2">
                            Patient/Guardian Signature
                          </div>
                          <div className="border border-[var(--border)] rounded-lg p-2 bg-white">
                            <Image
                              src={selectedNote.patientSignature}
                              alt="Patient Signature"
                              width="100%"
                              height={100}
                              style={{ objectFit: "contain" }}
                              preview={true}
                            />
                          </div>
                        </div>
                      )}
                      {selectedNote.staffSignature && (
                        <div>
                          <div className="text-xs text-[var(--text-secondary)] mb-2">
                            Staff Signature
                          </div>
                          <div className="border border-[var(--border)] rounded-lg p-2 bg-white">
                            <Image
                              src={selectedNote.staffSignature}
                              alt="Staff Signature"
                              width="100%"
                              height={100}
                              style={{ objectFit: "contain" }}
                              preview={true}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <Empty
              description="Select a note from the list to view details"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          )}
        </div>
      </div>
    </div>
  );
}
