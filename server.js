const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const PSD = require('psd');
const upload = multer({ dest: 'uploads/' });

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

app.post('/upload', upload.single('psdFile'), (req, res) => {
    const psd = PSD.fromFile(req.file.path);
    psd.parse();

    const psdInfo = psd.tree().export();
    res.json(psdInfo);
});

app.listen(port, () => console.log(`Le serveur écoute sur le port ${port}!`));

app.post('/export', upload.single('psdFile'), (req, res) => {
    const psdPath = req.file.path; // Chemin du fichier PSD uploadé
    const outputPath = psdPath.replace('.psd', '.png'); // Chemin de sortie du fichier PNG

    const psd = PSD.fromFile(psdPath);
    psd.parse();

    psd.image.saveAsPng(outputPath).then(() => {
        res.download(outputPath, (err) => {
            if (err) {
                console.error(err);
                res.status(500).send('Erreur lors de l\'exportation du fichier PNG.');
            }
            // Optionnel : Supprimer le fichier PNG après 
            // fs.unlink(outputPath, (err) => {
            //   if (err) console.error(err);
            // });
        });
    }).catch(err => {
        console.error(err);
        res.status(500).send('Erreur lors du traitement du fichier PSD.');
    });
});
