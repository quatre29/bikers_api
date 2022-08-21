import app from "./app";

const { PORT } = process.env;

app.listen(PORT, () => {
  console.log(`listenin to port ${PORT}...`);
});
