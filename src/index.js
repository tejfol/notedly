import express from 'express';

const app = express();
const port = process.env.PORT || 4000;

app.get('/', (req, res) => res.send('Hellow World!'));

app.listen(port, () => console.log(`listening on port ${port}`));
