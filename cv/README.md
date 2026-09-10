# CV

`generar-cv.js` construye `Francisco-Ponte-CV.docx` a partir de los datos
escritos en el propio script. Para regenerarlo:

```bash
npm install docx          # solo la primera vez
node generar-cv.js
```

El PDF se obtiene abriendo el .docx y exportando, o con LibreOffice:

```bash
soffice --headless --convert-to pdf Francisco-Ponte-CV.docx
```

El PDF que descarga la web vive en `client/public/cv/francisco-ponte-cv.pdf`:
al actualizar el CV hay que copiarlo también ahí.
