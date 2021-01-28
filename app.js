import express from 'express';
export const app = express();
const port = 3000;

app.use(express.json());
app.listen(port, () => {
  console.log('listening at http://localhost:%d', port);
});
