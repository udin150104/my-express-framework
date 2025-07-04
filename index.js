require('dotenv').config();
const app = require('./bootstrap/app');

const port = process.env.PORT || 3000;
const hostname = process.env.HOSTNAME || `http://localhost`;
app.listen(port, () => {
  console.log(`🚀 Server running at ${hostname}:${port}`);
});
