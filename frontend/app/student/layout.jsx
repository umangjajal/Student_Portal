"use client";
import withRoleLayout from "@/utils/withRoleLayout";

function StudentLayout({ children }) {
  return <div>{children}</div>;
}

export default withRoleLayout("STUDENT", StudentLayout);
