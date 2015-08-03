DOCUMENT = memoria

all:	pdf bibtex

	
pdf:	 
	pdflatex $(DOCUMENT)

		
bibtex: biblio.bib
	bibtex $(DOCUMENT)
	pdflatex $(DOCUMENT)
	
		
clean:
	rm -f *.log *.lof *.toc *.aux *.bbl *.blg *.ist *.lot *.dvi 

mrproper: clean
	rm -f *.pdf
	
