import { createServer } from "./index";

const port = Number(process.env.PORT) || 3000;
const app = createServer();

app.listen(port, () => {
  console.log(`🚀 API running at http://localhost:${port}`);
});
