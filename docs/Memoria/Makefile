DOCUMENT = memoria

all:	pdf ps
	
	
pdf:	dvi
	dvipdf $(DOCUMENT)
	
ps:	dvi
	dvips $(DOCUMENT) -o	

dvi: 	aux bibtex 

aux:	 
	latex $(DOCUMENT)
	latex $(DOCUMENT)
	
		
bibtex: biblio.bib
	bibtex $(DOCUMENT)
	latex $(DOCUMENT)
	latex $(DOCUMENT)
	
		
clean:
	rm -f *.log *.lof *.toc *.aux  *.bbl *.blg *.ist *.lot *.dvi 

mrproper: clean
	rm -f *.ps *.pdf
	
