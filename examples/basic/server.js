import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import https from 'https';

const hostname = 'cogsbox.com'; 
const port = 60010;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const buildPath = path.join(__dirname, 'dist');

const certPath = '/home/cogsbox/ssl/certs/webdisk_cogsbox_com_a3099_22473_1758379898_d423685a4121854888e37ba65b38d64d.crt';
const keyPath = '/home/cogsbox/ssl/keys/a3099_22473_d5f1556304d5611b72b4c6fdd8335975.key';

const privateKey = fs.readFileSync(keyPath, 'utf8');
const certificate = fs.readFileSync(certPath, 'utf8');

const app = express();
app.use(express.static(buildPath));

app.use('/chris', express.static(buildPath));

app.get(/^\/chris\//, (req, res) => {
    console.log(`Route matched by RegExp: ${req.path}. Sending index.html.`);
    res.sendFile(path.join(buildPath, 'index.html'));
});

app.get('/', (req, res) => {
    res.sendFile(path.join(buildPath, 'index.html'));
});


const httpsServer = https.createServer({
    key: privateKey,
    cert: certificate,
    rejectUnauthorized: false
}, app);

httpsServer.listen(port, () => {
    console.log(`> HTTPS Server ready on https://${hostname}:${port}`);
});