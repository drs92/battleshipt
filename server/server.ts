import { join } from 'path';
import * as express from 'express';

const CLIENT_PATH = join(__dirname, '../client');
const PORT = process.env.PORT || 3000;

let app = express();

app.use(express.static(CLIENT_PATH));

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}.`);
});