import app from './app';
import { MongoHelper } from './mongoHelper';

const port = 3000;
app.listen(port, async () => {
  console.info(`Listening on port ${port}`);
  try {
    await MongoHelper.connect(`mongodb://localhost:27017/task`);
    console.info(`Connected to Mongo!`);
  } catch (err) {
    console.error(`Unable to connect to Mongo!`, err);
  }
  console.log(`this server is running on port ${port} `);
});
