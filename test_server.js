const express = require("express");
const printer = require("pdf-to-printer");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(express.json());

app.use(
  cors({
    origin: ["http://localhost:3000", "http://49.50.132.197:3000"],
    credentials: true,
  })
);

app.post("/print", async (req, res) => {
  try {
    // 프린터 목록 확인
    const printers = await printer.getPrinters();
    console.log("printers: ", printers);

    const filePath = path.join("C:", "print_jobs", "test.pdf");

    // PDF 자동 인쇄
    await printer.print(filePath, {
      printer: "HP LaserJet 1020", // 원하는 프린터 이름
      scale: "fit",
    });

    res.send("✅ Printed successfully!");
  } catch (error) {
    console.error("Print failed:", error);
    res.status(500).send("❌ Print failed");
  }
});

app.listen(4000, () => console.log("Print server running on port 4000"));
