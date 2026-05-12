import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { google } from "googleapis";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // Google Sheets Auth
  const auth = new google.auth.JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: (process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY || "").replace(/\\n/g, "\n"),
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  const sheets = google.sheets({ version: "v4", auth });

  // API: Register student
  app.post("/api/register", async (req, res) => {
    const { registrationType, roomTitle, referenceCode, students } = req.body;

    if (!process.env.GOOGLE_SHEET_ID) {
      console.warn("GOOGLE_SHEET_ID not set. Logging registration instead.");
      console.log("Registration:", req.body);
      return res.json({ success: true, message: "Logged (Development Mode)" });
    }

    const studentNames = students.map((s: any) => s.fullName).join(", ");
    const studentGenders = students.map((s: any) => s.gender).join(", ");
    const studentPhones = students.map((s: any) => s.phone).join(", ");

    try {
      await sheets.spreadsheets.values.append({
        spreadsheetId: process.env.GOOGLE_SHEET_ID,
        range: "Sheet1!A:G",
        valueInputOption: "USER_ENTERED",
        requestBody: {
          values: [
            [
              new Date().toISOString(),
              referenceCode,
              roomTitle,
              registrationType,
              studentNames,
              studentGenders,
              studentPhones,
            ],
          ],
        },
      });
      res.json({ success: true });
    } catch (error) {
      console.error("Google Sheets Error:", error);
      res.status(500).json({ success: false, error: "Failed to save registration" });
    }
  });

  // API: Get status
  app.get("/api/status/:referenceCode", async (req, res) => {
    const { referenceCode } = req.params;

    if (!process.env.GOOGLE_SHEET_ID) {
      return res.json({ success: true, status: "Pending Review" });
    }

    try {
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: process.env.GOOGLE_SHEET_ID,
        range: "Sheet1!A:H", // Includes Column H (Admission Status)
      });

      const rows = response.data.values;
      if (!rows || rows.length === 0) {
        return res.status(404).json({ success: false, error: "Reference code not found" });
      }

      // Skip the header row (index 0) and find the matching reference code
      // Reference code is in column B (index 1)
      const row = rows.slice(1).find((r) => r[1] === referenceCode);

      if (!row) {
        return res.status(404).json({ success: false, error: "Reference code not found" });
      }

      // Column H is index 7
      const status = row[7] || "Pending Review"; // If blank, default to "Pending Review"

      res.json({ success: true, status });
    } catch (error) {
      console.error("Google Sheets Error:", error);
      res.status(500).json({ success: false, error: "Failed to fetch status" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
