import University from "../models/University.js";

/* Get all universities */
export const getUniversities = async (req, res) => {
  const universities = await University.find();
  res.json(universities);
};

/* Approve university */
export const approveUniversity = async (req, res) => {
  const university = await University.findById(req.params.id);
  if (!university) {
    return res.status(404).json({ message: "University not found" });
  }

  university.approved = true;
  await university.save();

  res.json({ message: "University approved successfully" });
};
