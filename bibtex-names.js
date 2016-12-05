/* Version 1.0 by (c) 2016, JDMCreator. Released under MIT License */

(function(){
var isLowerCase = function(str){
	var strU = str.toUpperCase();
	return strU !== str && strU !== str.toLowerCase();
},
trim = function(str){
	return str.replace(/^[\s\uFEFF\xA0~]+|[\s\uFEFF\xA0~]+$/g, '');
},
realTrim = function(str){
	return str.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
}
isALetter = function(str){
	str = str.charAt(0);
	return str.toUpperCase() !== str.toLowerCase();
},
execBlocks = function(str, dic){
	return str.replace(/\{([_^]?[0-9]+)\}/g, function(a, b){
		return dic[b];
	});
},
isLowerCaseAt = function(str, pos){
	var c = str.charAt(pos),
	    c2;
	if(isALetter(c)){
		return c === c.toLowerCase();
	}
	else if(c == "{"){
		c2 = str.charAt(pos+1);
		if(c2){
			return c2 == "_";
		}
	}
	return false;
},
isUpperCaseAt = function(str, pos){
	var c = str.charAt(pos),
	    c2;
	if(isALetter(c)){
		return c === c.toUpperCase();
	}
	else if(c == "{"){
		c2 = str.charAt(pos+1);
		if(c2){
			return c2 == "^";
		}
	}
	return false;
},
parseBibtexNames = function(names){

var latexBlocks = {},
lbcount = 0;

if(names.indexOf("{") >= 0 || names.indexOf("\\") >=0){
	var futnames = "",
	typeBlock = "",
	lBlock = "",
	count = 0,
	swcommand = false,
	foundFirstWhiteSpace = false,
	foundFirstCharacter = false,
	inlatex = false;
	for(var i=0, l = names.length, c;i<l;i++){
		c = names.charAt(i);
		if(!inlatex && c == "\\"){
			futnames += "" + c + names.charAt(i+1);
			i++;
			continue;
		}
		else if(!inlatex && c != "{"){
			futnames += "" + c;
			continue;
		}
		else if(!inlatex && c=="{"){
			inlatex = true;
			lBlock += c;
			if(names.charAt(i+1) == "\\"){
				swcommand = true;
			}
			continue;
		}
		else if(inlatex){
			if(swcommand && !foundFirstCharacter && foundFirstWhiteSpace && isALetter(c)){
				typeBlock = "^";
				if(isLowerCase(c)){
					typeBlock="_";
				}
				foundFirstCharacter = true;
			}
			else if(swcommand && !foundFirstWhiteSpace){
				if(/^[\{\s]$/.test(c)){
					foundFirstWhiteSpace = true;
				}
			}
			if(c == "\\"){
				var nextChar = names.charAt(i+1);
				if(nextChar && (nextChar == "{" || nextChar == "\\" || nextChar == "}")){
					lBlock += c + nextChar;
					i++;
					continue;
				}
				else if(foundFirstWhiteSpace && !foundFirstCharacter){
					foundFirstWhiteSpace = false;		
				}
			}
			if(c == "{"){
				count++;
				lBlock += c;
				continue;
			}
			if(c == "}"){
				if(count <= 0 || i+1<l.length){
					inlatex = false;
					lBlock += c;
					var id = typeBlock + (lbcount++);
					futnames += "{"+id+"}";
					latexBlocks[id] = lBlock;
					lBlock = typeBlock = "";
					swcommand = foundFirstWhiteSpace = foundFirstCharacter = false;
				}
				else{
					count--;
					lBlock += c;
				}
				continue;
			}
			else{
				if(!typeBlock && !swcommand){
					if(isALetter(c)){
						typeBlock = "^";
					}
				}
				lBlock += c;
				continue;
			}
		}
	}
}

names = realTrim(futnames || names).split(/(?:\s+and\s+)(?=.)/ig);
var results = [];
for(var i = 0;i<names.length;i++){
	results.push(analyseName(names[i], latexBlocks));
}
return results;
},
analyseName = function(name, latexBlocks){
	var commas = name.split(/\s*,\s*/g),
	nbCommas = commas.length-1,
	blocks = analyseFirstBlock(trim(commas[0]), nbCommas, latexBlocks);

	if(nbCommas == 1){
		blocks.first = execBlocks(trim(commas[1]), latexBlocks)
	}
	if(nbCommas == 2){
		blocks.jr = execBlocks(trim(commas[1]), latexBlocks)
		blocks.first = execBlocks(trim(commas[2]), latexBlocks)
	}
	return blocks;
},
analyseFirstBlock = function(str, commas, latexBlocks){
	var blocks = {},
	    first = commas>0,
	    endOfBlock = /[\~\s]+/g,
	    actualBlock = "",
	    typeOfBlock = "",
	    transition = "",
	    von = str,
	    startOfBlock = true,
	    futureBlock = "";
	// If there's no space, then it's a lastname
	if(!endOfBlock.test(str)){
		// lowercase "others" is a special token, which means most of the times "and al."
		if(str == "others" && commas == 0){
			return {special:str}
		}
		return {last:execBlocks(str, latexBlocks)};
	}
	// If there's a space and commas>0, there's no firstname
	for(var i=0, l=str.length, c;i<l;i++){
		c = str.charAt(i);
		if(!first){
			if(endOfBlock.test(c)){
				startOfBlock = true;
				transition += c;
				continue;
			}
			else if(startOfBlock && (isALetter(c) || c == "{")){
				if(isLowerCaseAt(str, i)){
					// end of firstname and start of von
					first = true;
					if(actualBlock){
						blocks["first"] = execBlocks(actualBlock, latexBlocks);
						// Set von part
						von = trim(str.substring((actualBlock+transition).length))
					}
					break;
				}
				else if(isUpperCaseAt(str, i)){
					startOfBlock = false;
					actualBlock += transition + futureBlock + "" + c;
					futureBlock = transition = "";
					continue;
				}
			}
			else if(startOfBlock){
				futureBlock += "" + c;	
			}
			else{
				actualBlock += "" + c;
			}
		} 
		else{
			break;
		}
	}
	if(!first){
		// An end to the first name was not found... it means there's no von

		var allBlocks = str.split(/[\s~]+/g),
		transitions = [],
		firstname = "";
		str.replace(/[\s~]+/g, function(a){
			transitions.push(a);
		});
		blocks.last = execBlocks(allBlocks[allBlocks.length-1], latexBlocks);
		allBlocks.pop();
		for(var i=0, l = allBlocks.length;i<l;i++){
			firstname += "" + allBlocks[i];
			if(i+1<l){
				firstname += transitions[i];
			}
		}
		blocks.first = execBlocks(firstname, latexBlocks);
	}
	else if(!endOfBlock.test(von)){
		// We skip the loop in the case of a name that look like "First last" (very rare)
		// Doing this is easier for the next step.
		blocks.last = execBlocks(von, latexBlocks);
		return blocks;
	}
	else{
		// Now, we have a last, we may have a von part and we found (or not) the first
		// Let's do a reverse boucle
		var lastname = "",
		futurelastname = "";
		startOfBlock = true;
		transition = "";
		von = " " + von;
		for(var i = von.length-1, c;i>-1;i--){
			c = von.charAt(i);
			if(endOfBlock.test(c)){
				if(futurelastname){
					// was last block a von ? 
					var uppercase = true;
					for(var j=i+1, d;j<von.length;j++){
						d = von.charAt(j);
						if(isALetter(d) || d == "{"){
							if(isLowerCaseAt(von, j)){
								uppercase = false;
								break;
							}
							else if(isUpperCaseAt(von, j)){
								break;
							}
						}
						else if(endOfBlock.test(d)){
							break;
						}
					}
					if(uppercase){
						lastname = futurelastname + transition + lastname;
						transition = c;
						futurelastname = "";
					}
					else{
						blocks.last = execBlocks(trim(lastname), latexBlocks);
						von = von.substring(0, von.length-(transition + lastname).length);
						blocks.von = execBlocks(trim(von), latexBlocks);
						break;
					}
				}
				else {
					transition = c + transition;					
				}
			}
			else{
				futurelastname = c + "" + futurelastname;
			}
		}
	}
	if(!blocks.hasOwnProperty("last")){
		// Two scenario here
		// 1) Everything is lastname ("von" is also undefined)
		// 2) A bug happened. Shouldn't happen, but there's a lot of names in the world
		if(blocks.hasOwnProperty("von")){
			blocks.last = blocks.von;
			delete blocks.von;
		}
		else{
			blocks.last = execBlocks(trim(von), latexBlocks);
		}
	}
	return blocks;
};
window.parseBibtexNames = parseBibtexNames;
})();