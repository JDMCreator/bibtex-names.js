## bibtex-names.js

**Bibtex-names.js** allows you to parse names using the BibTeX format. It supports almost most of the cases and aims to support all of them. It understands basic LaTeX but doesn't parse it.

Version 1.0 [7.15KB original, 2.82KB minified, 1.29KB minified & gzipped]

#### To-Do list

* Support @String and variables
* Support quotes
* Add options

#### Example

    window.parseBibtexNames("Barack Obama and de la Fontaine, Jean and Thomson, jr., Aiden and others");
    
    /* [
		    { 
		      first : "Barack",
		      last  : "Obama"
		    },
		    {
		      first : "Jean",
		      last  : "Fontaine",
		      von   : "de la"
		    },
		    {
			    first : "Aiden",
			    jr : "jr.",
			    last : "Thomson"
		    },
		    {
		      special : "others"
		    }
       ] */

#### More examples

	{My Website Inc.}
	=> last : {My Website Inc.}

	Jean {d}e la Fontaine
	=> first : Jean {d}e
	last : Fontaine
	von : la

	Jean {\relax d}e la Fontaine
	=> first : Jean
	last : Fontaine
	von : {\relax d}e la

	Jean {-}de la Fontaine
	=> first : Jean
	last : Fontaine
	von : {-}de la

	jean de la Fontaine
	=> last : Fontaine
	von : jean de la

	Jean~de la Fontaine
	=> first : Jean
	last : Fontaine
	von : de la

	Jean de~la Fontaine
	=> first : Jean
	last : Fontaine
	von : de~la

	Jean de~la Fontaine du Bois Joli
	=> first : Jean
	last : Bois Joli
	von : de~la Fontaine du

	Jean de~la Fontaine du Bois Joli, jr, Adrien
	=> first : Adrien
	jr : jr
	last : Bois Joli
	von : Jean de~la Fontaine du
	
	Adrien Jean {d}e~la Fontaine~ ~{\relax d}u Bois Joli
	=> first : Adrien Jean {d}e
	last : Bois Joli
	von : la~Fontaine~ ~{\relax d}u

#### License, issues and details

Please report any issues or non-working names.

Released under MIT License.

Thanks to Jean-Michel Hufflen for his [wonderful and very helpful article about name format in BibTeX](https://www.tug.org/TUGboat/tb27-2/tb87hufflen.pdf).
