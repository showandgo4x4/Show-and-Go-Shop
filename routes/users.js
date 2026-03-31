import express from "express";
const router = express.Router();

router.get("/", (req, res) => {
  res.json({ message: "Users route works!" });
});

export default router; // <-- makes it compatible with default import
