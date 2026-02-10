"use client";
import withRoleLayout from "@/utils/withRoleLayout";

function FacultyLayout({ children }) {
  return <div>{children}</div>;
}

export default withRoleLayout("FACULTY", FacultyLayout);
