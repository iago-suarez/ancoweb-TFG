MEMORIA DO TFG ANCOWEB - UDC

--------------------------------------------------------------------------------
1. Software preciso
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
	aspell-gl-minimos
	
	kile -> editor latex de kde 	   


--------------------------------------------------------------------------------
2. Ficheiros
--------------------------------------------------------------------------------

memoria.tex
	Ficheiro principal. Inclue o resto de ficheiros .tex. Se se modifica
	o nome dalgún outro fichero .tex será preciso modificalo neste fichero.
	
portada.tex
	Portada 

agradecimientos.tex
	Dedicatoria e agradecementos
	
resumen.tex
	Resumen del proyecto
	
cap1_X.tex
cap2_X.tex
	Capítulos del proyecto. Podemos crear un fichero por capítulo
	o agrupar varios capítulos en un mismo fichero. Si creamos más ficheros
	debemos incluirlos en memoria.tex
	
biblio.bib
	Bibliografía en formato bibtex
	
apen1.tex
	Apéndices do proxecto. Podese crear un fichero por apéndice ou
	agrupar todo-los apéndices nun só fichero. Se creamos mais ficheiros
	debemos incluilos en memoria.tex	
	
Makefile
	Contén reglas para compilar o código fonte. 

pfc-fic.bst
	Estilo da bibliografía

--------------------------------------------------------------------------------
3. Compilación
--------------------------------------------------------------------------------

Regras principais do fichero Makefile:

make all
	Compila código fonte e bibliografía e xera os ficheiros ps e pdf

make pdf
	Compila código fonte e bibliografía e xera o fichero pdf
	
make clean 
	Elimina ficheros auxiliares (mantiene pdf e ps)


--------------------------------------------------------------------------------
4. Notas importantes
--------------------------------------------------------------------------------

a. Codificación de caracteres
	
ISO-8859-15
	Outra codificación de caracteres pode ocasionar problemas na
	compilación de acentos. 
	En kile, por exemplo, é posibel seleccionar el tipo de codificación
	dos ficheros.
	
b. Formato de las figuras

EPS/PS
	Únicos formatos aceptados por latex
	
JPG/PNG/PDF
	Formato aceptados por pdflatex. 
	Se se desexa empregar este tipo de formatos, sustituir Makefile por
	Makefile.pdflatex
	
	
IMPORTANTE: Insertanse figuras en formato eps/ps ou en formato jpg/png/pdf pero
NUNCA se pueden mesturar ambos tipos de figuras no mesmo código latex.
		
