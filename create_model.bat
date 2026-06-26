copy %1 Modlefile_Egent_O
node txt2translate4txt.js Modelfile_Egent_O -jp2en
ollama create Egent_O -f Modelfile_Egent_O

