// SAP SuccessFactors data mapper — converts SF entities to OrgPosition tree
// This is the core data pipeline: SF OData → @orgchart/core model

import type { OrgPosition, OrgPerson, OrgEdge } from "@orgchart/core";
import type { SFDepartment, SFPosition, SFEmpJob, SFPerson } from "./sf-mock-data";
import { THEMES } from "@orgchart/core";

/**
 * Map SAP SuccessFactors data into an OrgPosition tree and edge list.
 * Uses Position-based hierarchy (parentPosition) as the primary structure.
 */
export function mapSFToOrgChart(
  departments: SFDepartment[],
  positions: SFPosition[],
  empJobs: SFEmpJob[],
  persons: SFPerson[],
  themeKey = "blue",
): { roots: OrgPosition[]; edges: OrgEdge[] } {
  const colors = THEMES[themeKey] ?? THEMES.blue;
  const personMap = new Map(persons.map((p) => [p.userId, p]));
  const jobMap = new Map(empJobs.map((j) => [j.position, j])); // position code → job
  const deptMap = new Map(departments.map((d) => [d.externalCode, d]));

  // Build OrgPosition for each SF Position
  const posMap = new Map<string, OrgPosition>();

  positions.forEach((sfPos) => {
    const job = jobMap.get(sfPos.code);
    const person = job ? personMap.get(job.userId) : null;
    const dept = deptMap.get(sfPos.department);

    // Determine depth for color assignment
    let depth = 1;
    let parentCode = sfPos.parentPosition;
    while (parentCode) {
      depth++;
      const parentPos = positions.find((p) => p.code === parentCode);
      parentCode = parentPos?.parentPosition ?? "";
    }

    const incumbent: OrgPerson | null = person && job
      ? {
          employeeId: person.userId,
          name: `${person.lastName}${person.firstName}`,
          nameEn: `${person.firstNameEn} ${person.lastNameEn}`,
          email: person.email,
          phone: person.phone,
          photoUrl: person.photoUrl,
          location: sfPos.location,
          startDate: job.startDate,
          employmentType: (job.employmentType === "FT" ? "FT" : "PT") as OrgPerson["employmentType"],
          rr: "",
          rrEn: "",
        }
      : null;

    const orgPos: OrgPosition = {
      id: sfPos.code,
      parentId: sfPos.parentPosition,
      code: sfPos.code,
      dept: dept?.name ?? sfPos.department,
      deptEn: dept?.nameEn ?? sfPos.department,
      title: sfPos.title,
      titleEn: sfPos.titleEn,
      name: incumbent?.name ?? "",
      pageGroup: "ALL",
      sortOrder: 0,
      roleType: incumbent ? "normal" : "vacant",
      layoutType: "standard",
      showInOverview: true,
      showInDetail: true,
      bgColor: "#" + colors[Math.min(depth - 1, colors.length - 1)],
      level: depth,
      children: [],
      parent: null,
      searchMatched: false,
      searchHasMatch: false,
      fte: sfPos.fte,
      grade: sfPos.jobCode,
      costCenter: dept?.costCenter ?? "",
      isAssistant: false,
      isSubsidiary: false,
      status: "active",
      incumbent,
      metadata: {
        sfDepartment: sfPos.department,
        sfLocation: sfPos.location,
      },
    };

    posMap.set(sfPos.code, orgPos);
  });

  // Build parent-child relationships
  posMap.forEach((pos) => {
    if (pos.parentId) {
      const parent = posMap.get(pos.parentId);
      if (parent) {
        pos.parent = parent;
        parent.children.push(pos);
      }
    }
  });

  // Sort children
  posMap.forEach((pos) => {
    pos.children.sort((a, b) => a.sortOrder - b.sortOrder);
  });

  const roots = [...posMap.values()].filter((p) => !p.parent);

  // Build dotted-line edges from matrixManager
  const edges: OrgEdge[] = [];
  empJobs.forEach((job) => {
    if (job.matrixManager) {
      const managerJob = empJobs.find((j) => j.userId === job.matrixManager);
      if (managerJob) {
        edges.push({
          edgeId: `matrix_${job.position}_${managerJob.position}`,
          fromNodeId: managerJob.position,
          toNodeId: job.position,
          edgeType: "dotted",
          pageScope: "local",
          label: "Matrix",
          showInOverview: true,
          showInDetail: true,
        });
      }
    }
  });

  return { roots, edges };
}
