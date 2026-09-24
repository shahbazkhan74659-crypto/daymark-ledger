import "dotenv/config";
import { app } from "./app.js";

const port = process.env.PORT ?? 3001;

app.listen(port, () => {
  console.log(`Daymark Ledger backend listening on port ${port}`);
});
