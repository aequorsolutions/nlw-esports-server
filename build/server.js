import express from 'express';
const app = express();
app.get('/ads', (req, res) => {
    console.log('Acessou ads!');
    return res.json([
        { id: 1, name: 'Anunico 1' },
        { id: 2, name: 'Anunico 2' },
        { id: 3, name: 'Anunico 3' },
        { id: 4, name: 'Anunico 4' },
    ]);
});
app.listen(3333);
