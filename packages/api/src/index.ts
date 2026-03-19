import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.js";
import formsRoutes from "./routes/forms.js";
import responsesRoutes from "./routes/responses.js";

const app = express();
const PORT = Number(process.env.PORT ?? 3001);

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/forms", formsRoutes);
app.use("/api", responsesRoutes);

app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
});

export default app;
