import type { College } from "../../../shared";

export function getCollegeDetails(collegeId: string, colleges: College[]) {
  if (collegeId.startsWith("Custom:")) {
    const separatorIndex = collegeId.indexOf("|");
    const name = separatorIndex !== -1 ? collegeId.substring(7, separatorIndex) : collegeId.substring(7);
    const type = separatorIndex !== -1 ? (collegeId.substring(separatorIndex + 1) as "Public" | "Private") : "Public";
    return { name, type, isCustom: true };
  }
  const college = colleges.find((c) => c.id === collegeId);
  return {
    name: college?.name || collegeId,
    type: college?.type || "Public",
    isCustom: false
  };
}
