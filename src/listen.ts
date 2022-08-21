import app from "./app";

const { PORT = 9090 } = process.env;

app.listen(PORT, () => {
  console.log(`listenin to port ${PORT}...`);
});
