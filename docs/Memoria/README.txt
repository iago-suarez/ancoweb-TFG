PLANTILLA PARA PFC - UDC

--------------------------------------------------------------------------------
1. Software necesario
--------------------------------------------------------------------------------

Paquetes debian/ubuntu:
	
	texlive 		   
	texlive-base		   
	texlive-base-bin	   
	texlive-bibtex-extra	   
	texlive-common  	   
	texlive-font-utils	   
	texlive-fonts-extra	   
	texlive-fonts-recommended  
	texlive-generic-extra	   
	texlive-generic-recommended
	texlive-humanities	   
	texlive-lang-spanish	   
	texlive-latex-base	   
	texlive-latex-extra	   
	texlive-latex-recommended  
	texlive-math-extra	   
	texlive-science
	
	kile -> editor latex de kde 	   


--------------------------------------------------------------------------------
2. Ficheros
--------------------------------------------------------------------------------

memoria.tex
	Fichero principal. Incluye el resto de ficheros .tex. Si se modifica
	el nombre de algún otro fichero .tex será necesario modificarlo en 
	este fichero.
	
portada.tex
	Portada 

agradecimientos.tex
	Dedicatoria y agradecimientos
	
especificación.tex
	Especificación estándar requerida por las normas

resumen.tex
	Resumen del proyecto
	
cap1.tex
cap2.tex
	Capítulos del proyecto. Podemos crear un fichero por capítulo
	o agrupar varios capítulos en un mismo fichero. Si creamos más ficheros
	debemos incluirlos en memoria.tex
	
biblio.bib
	Bibliografía en formato bibtex
	
apen1.tex
	Apéndices del proyecto. Podemos crear un fichero por apéndice o
	agrupar todos los apéndices en un sólo fichero. Si creamos más ficheros
	debemos incluirlos en memoria.tex	
	
Makefile
	Contiene reglas para compilar el código fuente. 

pfc-fic.bst
	Estilo de bibliografía

--------------------------------------------------------------------------------
3. Compilación
--------------------------------------------------------------------------------

Reglas principales del fichero Makefile:

make all
	Compila código fuente y bibliografía y genera los ficheros ps y pdf

make pdf
	Compila código fuente y bibliografía y genera el fichero pdf
	
make clean 
	Elimina ficheros auxiliares (mantiene pdf y ps)


--------------------------------------------------------------------------------
4. Notas importantes
--------------------------------------------------------------------------------

a. Codificación de caracteres
	
ISO-8859-15
	Otra codificación de caracteres puede ocasionar problemas en la 
	compilación de acentos. 
	En kile, por ejemplo, es posible seleccionar el tipo de codificación
	de los ficheros.
	
b. Formato de las figuras

EPS/PS
	Únicos formatos aceptados por latex
	
JPG/PNG/PDF
	Formato aceptados por pdflatex. 
	Si se desea utilizar este tipo de formatos, sustituir Makefile por
	Makefile.pdflatex
	
	
IMPORTANTE: se insertan figuras en formato eps/ps ó en formato jpg/png/pdf pero
NUNCA se pueden mezclar ambos tipos de figuras en un mismo código latex.
		
