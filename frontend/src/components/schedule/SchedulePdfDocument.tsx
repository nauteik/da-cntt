import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";
import type { ScheduleEventDTO, ScheduleEventStatus } from "@/types/schedule";
import dayjs from "dayjs";

interface SchedulePdfDocumentProps {
  events: ScheduleEventDTO[];
  title: string;
}

// Define styles for the PDF
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 9,
    fontFamily: "Helvetica",
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 10,
    color: "#666",
  },
  dateSection: {
    marginBottom: 14,
  },
  dateSectionHeader: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#1890ff",
    marginBottom: 10,
    paddingBottom: 5,
    borderBottom: "1px solid #e0e0e0",
  },
  eventsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
  },
  eventRow: {
    marginBottom: 8,
    padding: 8,
    backgroundColor: "#ffffff",
    borderRadius: 4,
    width: 200,
    marginRight: 10,
  },
  eventHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  serviceCode: {
    fontSize: 11,
    fontWeight: "bold",
    marginRight: 8,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 5,
  },
  statusText: {
    fontSize: 9,
    color: "#666",
  },
  eventDetails: {
    marginTop: 4,
  },
  detailsRow: {
    flexDirection: "row",
  },
  detailsLabelCol: {
    flex: 1,
  },
  detailsValueCol: {
    flex: 1.3,
  },
  detailLabel: {
    fontSize: 9,
    color: "#666",
    marginBottom: 3,
  },
  detailValue: {
    fontSize: 9,
    color: "#000",
    marginBottom: 3,
  },
  noEvents: {
    textAlign: "center",
    color: "#999",
    marginTop: 50,
    fontSize: 12,
  },
});

// Get status color based on status enum
const getStatusColor = (status: ScheduleEventStatus): string => {
  const colorMap: Record<ScheduleEventStatus, string> = {
    PLANNED: "#faad14", // Orange
    CONFIRMED: "#ffd700", // Yellow/Gold
    IN_PROGRESS: "#1890ff", // Blue
    COMPLETED: "#52c41a", // Green
    CANCELLED: "#ff4d4f", // Red
  };
  return colorMap[status] || "#d9d9d9";
};

// Format time from ISO datetime string
const formatTime = (datetime?: string): string => {
  if (!datetime) return "-";
  try {
    return dayjs(datetime).format("h:mm A");
  } catch {
    return "-";
  }
};

// Format date to "Month DD - DAY_NAME"
const formatDateHeader = (date: string): string => {
  try {
    const d = dayjs(date);
    return `${d.format("MMMM DD")} - ${d.format("dddd").toUpperCase()}`;
  } catch {
    return date;
  }
};

// Group events by date
const groupEventsByDate = (events: ScheduleEventDTO[]): Record<string, ScheduleEventDTO[]> => {
  const grouped: Record<string, ScheduleEventDTO[]> = {};
  
  events.forEach((event) => {
    const dateKey = event.eventDate;
    if (!grouped[dateKey]) {
      grouped[dateKey] = [];
    }
    grouped[dateKey].push(event);
  });

  // Sort events within each day by start time
  Object.keys(grouped).forEach((date) => {
    grouped[date].sort((a, b) => {
      const timeA = dayjs(a.startAt);
      const timeB = dayjs(b.startAt);
      return timeA.isBefore(timeB) ? -1 : 1;
    });
  });

  return grouped;
};

const SchedulePdfDocument: React.FC<SchedulePdfDocumentProps> = ({ events, title }) => {
  if (!events || events.length === 0) {
    return (
      <Document>
        <Page size="A4" style={styles.page}>
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
          </View>
          <Text style={styles.noEvents}>No events to export</Text>
        </Page>
      </Document>
    );
  }

  // Group events by date and sort dates
  const eventsByDate = groupEventsByDate(events);
  const sortedDates = Object.keys(eventsByDate).sort();

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
        </View>

        {/* Events grouped by date */}
        {sortedDates.map((date) => {
          const dayEvents = eventsByDate[date];
          
          return (
            <View key={date} style={styles.dateSection}>
              {/* Date Header */}
              <Text style={styles.dateSectionHeader}>
                {formatDateHeader(date)}
              </Text>

              {/* Events for this date */}
              <View style={styles.eventsContainer}>
              {dayEvents.map((event) => (
                <View key={event.id} style={styles.eventRow}>
                  {/* Event Header: Service Code + Status */}
                  <View style={styles.eventHeader}>
                    <Text style={styles.serviceCode}>
                      {event.serviceCode || event.eventCode || "N/A"}
                    </Text>
                    <View style={styles.statusContainer}>
                      <View
                        style={[
                          styles.statusDot,
                          { backgroundColor: getStatusColor(event.status) },
                        ]}
                      />
                      <Text style={styles.statusText}>{event.status}</Text>
                    </View>
                  </View>

                  {/* Event Details */}
                  <View style={styles.eventDetails}>
                    <View style={styles.detailsRow}>
                      {/* Labels column */}
                      <View style={styles.detailsLabelCol}>
                        <Text style={styles.detailLabel}>Schedule:</Text>
                        <Text style={styles.detailLabel}>Client:</Text>
                        <Text style={styles.detailLabel}>Call In:</Text>
                        <Text style={styles.detailLabel}>Call Out:</Text>
                      </View>

                      {/* Values column */}
                      <View style={styles.detailsValueCol}>
                        <Text style={styles.detailValue}>
                          {formatTime(event.startAt)} - {formatTime(event.endAt)}
                        </Text>
                        <Text style={styles.detailValue}>
                          {event.patientName || "N/A"}
                        </Text>
                        <Text style={styles.detailValue}>
                          {formatTime(event.checkInTime)}
                        </Text>
                        <Text style={styles.detailValue}>
                          {formatTime(event.checkOutTime)}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              ))}
              </View>
            </View>
          );
        })}
      </Page>
    </Document>
  );
};

export default SchedulePdfDocument;

