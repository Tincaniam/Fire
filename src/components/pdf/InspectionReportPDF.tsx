import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";
import type { InspectionReport, Site, Client, User, InspectionItem, Deficiency } from "@prisma/client";

type ReportWithRelations = InspectionReport & {
  site: Site & { client: Client };
  technician: User;
  lineItems: InspectionItem[];
  deficiencies: Deficiency[];
};

const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 10,
    color: "#1a1a1a",
    padding: 40,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 2,
    borderBottomColor: "#5e81ac",
  },
  companyName: {
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
    color: "#5e81ac",
  },
  reportTitle: {
    fontSize: 11,
    color: "#555",
    marginTop: 2,
  },
  metaGrid: {
    flexDirection: "row",
    gap: 24,
    marginBottom: 20,
  },
  metaBox: {
    flex: 1,
    backgroundColor: "#f9fafb",
    borderRadius: 4,
    padding: 10,
  },
  metaLabel: {
    fontSize: 8,
    color: "#888",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 3,
  },
  metaValue: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
  },
  sectionTitle: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    color: "#555",
    marginBottom: 8,
    marginTop: 16,
  },
  table: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 4,
    overflow: "hidden",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f3f4f6",
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  tableHeaderText: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    letterSpacing: 0.3,
    color: "#555",
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
  },
  tableRowAlt: {
    backgroundColor: "#fafafa",
  },
  col1: { flex: 1 },
  col2: { width: 48, textAlign: "center" },
  itemText: { fontSize: 9 },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    textAlign: "center",
  },
  pass: { backgroundColor: "#d1fae5", color: "#065f46" },
  fail: { backgroundColor: "#fee2e2", color: "#991b1b" },
  na: { backgroundColor: "#f3f4f6", color: "#6b7280" },
  defRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
  },
  defBadge: {
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 3,
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    width: 52,
    textAlign: "center",
  },
  moderate: { backgroundColor: "#fef3c7", color: "#92400e" },
  high: { backgroundColor: "#ffedd5", color: "#9a3412" },
  critical: { backgroundColor: "#fee2e2", color: "#991b1b" },
  low: { backgroundColor: "#f3f4f6", color: "#6b7280" },
  resolved: { color: "#9ca3af", textDecoration: "line-through" },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    paddingTop: 8,
  },
  footerText: { fontSize: 8, color: "#9ca3af" },
});

import type { Style } from "@react-pdf/types";

const severityStyle = (s: string): Style => {
  const map: Record<string, Style> = {
    LOW: styles.low as Style,
    MODERATE: styles.moderate as Style,
    HIGH: styles.high as Style,
    CRITICAL: styles.critical as Style,
  };
  return (map[s] ?? styles.moderate) as Style;
};

export function InspectionReportPDF({ report }: { report: ReportWithRelations }) {
  const openDefs = report.deficiencies.filter((d) => !d.resolved);
  const resolvedDefs = report.deficiencies.filter((d) => d.resolved);

  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.companyName}>RavenLedger</Text>
            <Text style={styles.reportTitle}>Inspection Report</Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={{ fontSize: 9, color: "#555" }}>
              {new Date(report.inspectionDate).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </Text>
            <Text style={{ fontSize: 8, color: "#aaa", marginTop: 2 }}>
              Report ID: {report.id.slice(-8).toUpperCase()}
            </Text>
          </View>
        </View>

        {/* Meta */}
        <View style={styles.metaGrid}>
          <View style={styles.metaBox}>
            <Text style={styles.metaLabel}>Client</Text>
            <Text style={styles.metaValue}>{report.site.client.name}</Text>
            {report.site.client.address && (
              <Text style={{ fontSize: 9, color: "#555", marginTop: 2 }}>
                {report.site.client.address}
              </Text>
            )}
          </View>
          <View style={styles.metaBox}>
            <Text style={styles.metaLabel}>Site</Text>
            <Text style={styles.metaValue}>{report.site.name}</Text>
            <Text style={{ fontSize: 9, color: "#555", marginTop: 2 }}>
              {report.site.address}
              {report.site.city ? `, ${report.site.city}` : ""}
              {report.site.state ? ` ${report.site.state}` : ""}
            </Text>
          </View>
          <View style={styles.metaBox}>
            <Text style={styles.metaLabel}>Technician</Text>
            <Text style={styles.metaValue}>
              {report.technician.name ?? report.technician.email}
            </Text>
            <Text style={{ fontSize: 9, color: "#555", marginTop: 2 }}>
              Service: {report.serviceType.replace(/_/g, " ")}
            </Text>
          </View>
        </View>

        {/* Checklist */}
        <Text style={styles.sectionTitle}>Inspection Checklist</Text>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderText, styles.col1]}>Item</Text>
            <Text style={[styles.tableHeaderText, styles.col2]}>Result</Text>
          </View>
          {report.lineItems.map((item, i) => (
            <View
              key={item.id}
              style={[styles.tableRow, i % 2 === 1 ? styles.tableRowAlt : {}]}
            >
              <Text style={[styles.itemText, styles.col1]}>{item.label}</Text>
              <View style={styles.col2}>
                <Text
                  style={[
                    styles.badge,
                    item.result === "PASS"
                      ? styles.pass
                      : item.result === "FAIL"
                      ? styles.fail
                      : styles.na,
                  ]}
                >
                  {item.result}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Notes */}
        {report.notes && (
          <>
            <Text style={styles.sectionTitle}>Notes</Text>
            <Text style={{ fontSize: 9, color: "#444", lineHeight: 1.5 }}>
              {report.notes}
            </Text>
          </>
        )}

        {/* Deficiencies */}
        {report.deficiencies.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>
              Deficiencies ({openDefs.length} open
              {resolvedDefs.length > 0 ? `, ${resolvedDefs.length} resolved` : ""})
            </Text>
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={[styles.tableHeaderText, { flex: 1 }]}>Description</Text>
                <Text style={[styles.tableHeaderText, { width: 60 }]}>Severity</Text>
                <Text style={[styles.tableHeaderText, { width: 56 }]}>Status</Text>
              </View>
              {report.deficiencies.map((d) => (
                <View key={d.id} style={styles.defRow}>
                  <Text
                    style={[
                      { flex: 1, fontSize: 9 },
                      d.resolved ? styles.resolved : {},
                    ]}
                  >
                    {d.description}
                    {d.notes ? `\n${d.notes}` : ""}
                  </Text>
                  <Text style={[styles.defBadge, severityStyle(d.severity)]}>
                    {d.severity.charAt(0) + d.severity.slice(1).toLowerCase()}
                  </Text>
                  <Text
                    style={[
                      styles.defBadge,
                      { width: 56, marginLeft: 4 },
                      d.resolved ? styles.pass : styles.fail,
                    ]}
                  >
                    {d.resolved ? "Resolved" : "Open"}
                  </Text>
                </View>
              ))}
            </View>
          </>
        )}

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>RavenLedger · Inspection Report</Text>
          <Text
            style={styles.footerText}
            render={({ pageNumber, totalPages }) =>
              `Page ${pageNumber} of ${totalPages}`
            }
          />
        </View>
      </Page>
    </Document>
  );
}
