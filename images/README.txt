IMAGES FOLDER
=============
Put your real image files here (photos, logos, etc.).

To add your professional teaching photo to the hero section:
1. Save your photo here as:  lansana-teaching.jpg  (recommended ~1000 x 1150px)
2. Open index.html and find:  <div class="portrait">
3. Replace the whole <div class="portrait"> ... </div> block with:

   <div class="portrait">
     <img src="images/lansana-teaching.jpg" alt="Lansana Coomber teaching"
          style="width:100%;height:100%;object-fit:cover;">
   </div>

A placeholder (portrait-placeholder.svg) is included in this folder as a reference.
