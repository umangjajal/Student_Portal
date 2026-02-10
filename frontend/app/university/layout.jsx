"use client";
import withRoleLayout from "@/utils/withRoleLayout";

function UniversityLayout({ children }) {
  return <div>{children}</div>;
}

export default withRoleLayout("UNIVERSITY", UniversityLayout);
