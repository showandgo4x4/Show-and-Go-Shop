import express from "express";
const router = express.Router();

router.get("/", (req, res) => {
  res.json({ message: "Orders route works!" });
});

export default router; // <-- THIS makes it compatible with `import orders from ...`
