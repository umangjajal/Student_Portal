import University from "../models/University.js";

/* =========================================
   GET ALL UNIVERSITIES (ADMIN)
========================================= */
export const getUniversities = async (req, res) => {
  try {
    const universities = await University.find().sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "Universities fetched successfully",
      count: universities.length,
      data: universities
    });

  } catch (error) {
    console.error("Get Universities Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch universities"
    });
  }
};


/* =========================================
   APPROVE UNIVERSITY (ADMIN)
========================================= */
export const approveUniversity = async (req, res) => {
  try {
    const { id } = req.params;

    const university = await University.findById(id);

    if (!university) {
      return res.status(404).json({
        success: false,
        message: "University not found"
      });
    }

    if (university.approved) {
      return res.status(400).json({
        success: false,
        message: "University is already approved"
      });
    }

    university.approved = true;
    await university.save();

    return res.status(200).json({
      success: true,
      message: "University approved successfully",
      data: university
    });

  } catch (error) {
    console.error("Approve University Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to approve university"
    });
  }
};
