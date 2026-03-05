import { createServer } from "./index";

const port = Number(process.env.PORT) || 4000;
const app = createServer();

app.listen(port, () => {
  console.log(`🚀 API running at http://localhost:${port}`);
});
