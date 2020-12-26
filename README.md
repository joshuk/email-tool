# email-tool

Inspired name, right? The idea behind this tool is to be able to import an image, draw boxes on it, add URLs/alt text and export it as HTML that will work in any email client.

---

A quick rundown of the features:

### W - Width
This is just used to set the width of the image. It's best this is done before any boxes are drawn, but it will work either way.

### B - Box
This tool is used to easily draw a box around a certain part of the image (for example, a button/link). It's basically a shorter way of making a row with three columns.

### hS - Horizontal Split
This tool will create a 'split' in the file horizontally, which is essentially just a new row. It will go from the bottom of the last row (or the top of the document if there aren't any) to where the user clicks, and will fill the entire width.

### vS - Vertical Split
This tool will split up a row into multiple columns. It's pretty much the same as the Horizontal Split tool, just with columns instead of rows.

### i - Info
This is just to add information to a box. If you click on a box using this tool, you'll be able to enter a URL and alt text that will be set for that specific section.

### E - Export
This is the button to export to HTML and Images. It will prompt you to enter a filename for all the files and an email subject (that will be added to the `<title>` tag).
When the export is finished it will spit out a .zip file containing the HTML and the images in the `/images` folder.

---

This project also uses the [JSZip](https://github.com/Stuk/jszip) and [js-beautify](https://github.com/beautify-web/js-beautify) packages. Big thanks to them for their great code.
