function _MaskAPI(){
	this.version = "0.4a";
	this.instances = 0;
	this.objects = {};
}
if (typeof MaskAPI == 'undefined') MaskAPI = new _MaskAPI();
function Mask(m, t){
	this.lenamechamp = '';
	this.mask = m;
	this.type = (typeof t == "string") ? t : "string";
	this.error = [];
	this.errorCodes = [];
	this.value = "";
	this.strippedValue = "";
	this.allowPartial = false;
	this.id = MaskAPI.instances++;
	this.arrTypeEvent = new Array;
	this.ref = "MaskAPI.objects['" + this.id + "']";
	MaskAPI.objects[this.id] = this;
}

Mask.prototype.activeDureeNegative = function (){
	this.ctrlSigneDuree=true; // lorsqu'il est à true, on effectue le contrôle sur le signe de la durée saisie
}

Mask.prototype.activeControleNombre = function (){
	this.ctrlNombre=true; // lorsqu'il est à true, on effectue le contrôle sur la partie entière et décimale du nombre saisie
}

Mask.prototype.activeControleNbNegatif = function (){
	this.ctrlNbNegatif=true; // lorsqu'il est à true, on effectue le contrôle sur la négativité du nombre saisi
}

Mask.prototype.activeControlePctg = function (){
	this.ctrlPctg=true; // lorsqu'il est à true, on effectue le contrôle sur la valeur du nombre saisi qui ne doit pas dépassé 100,00%
}



// define the attach(oElement) function
Mask.prototype.attach = function (o,p_firstmask){
	if (p_firstmask==null) p_firstmask=false;
	//$addEvent(o, "onkeydown", "return " + this.ref + ".isAllowKeyPress(event, this);", true);
	//$addEvent(o, "onkeyup", "return " + this.ref + ".getKeyPress(event, this);", true);
	//Si il existe une methode onchange on bascule sur le onchange sinon on reste sur le onblur
	
	var typeEvent = 'onblur';
	if (detecteOnChange(o)) {
		typeEvent = 'onchange';
	}
	$addEvent(o, typeEvent, "this.value = " + this.ref + ".format(this.value,this.name); ", p_firstmask);
	this.arrTypeEvent[o.name] = typeEvent;
}

Mask.prototype.isAllowKeyPress = function (e, o){
	if( this.type != "string" ) return true;
	var xe = new qEvent(e);

	if( ((xe.keyCode > 47) && (o.value.length >= this.mask.length)) && !xe.ctrlKey ) return false;
	return true;
}

Mask.prototype.getKeyPress = function (e, o, _u){
	this.allowPartial = true;
	var xe = new qEvent(e);

	//	var k = String.fromCharCode(xe.keyCode);

	if( (xe.keyCode > 47) || (_u == true) || (xe.keyCode == 8 || xe.keyCode == 46) ){
		var v = o.value, d;
		if( xe.keyCode == 8 || xe.keyCode == 46 ) d = true;
		else d = false

		if( this.type == "number" ) this.value = this.setNumber(v, d);
		else if( this.type == "date" ) this.value = this.setDateKeyPress(v, d);
		else this.value = this.setGeneric(v, d);

		o.value = this.value;
	}
	/* */

	this.allowPartial = false;
	return true;
}

Mask.prototype.format = function (s,lename){
	this.lenamechamp = lename;
	if( this.type == "number" ) this.value = this.setNumber(s);
	else if( this.type == "date" ) this.value = this.setDate(s);
	else if( this.type == "hour" ) this.value = this.setHour(s,false);
	else if( this.type == "hour24" ) this.value = this.setHour(s,true);
	else if( this.type == "duree" ) this.value = this.setDuree(s);	
	else this.value = this.setGeneric(s);
	
	return this.value;
}

Mask.prototype.throwError = function (c, e, v){
	this.error[this.error.length] = e;
	this.errorCodes[this.errorCodes.length] = c;
	//if (self.AfficheErreur!=null)
	alert(e+" "+v);
	
	var obj=eval('document.forms[0].'+this.lenamechamp);
	SetFocusSelect(this.lenamechamp);
	if (this.arrTypeEvent[this.lenamechamp]=='onchange') {
		SetValue(this.lenamechamp, '');
		v = '';
	}
	
	if( typeof v == "string" ) return v;
	return false;
}

Mask.prototype.throwError2 = function (c, e, v){
	this.error[this.error.length] = e;
	this.errorCodes[this.errorCodes.length] = c;
	alert(e);
	
	var obj=eval('document.forms[0].'+this.lenamechamp);
	SetFocusSelect(this.lenamechamp);
	if (this.arrTypeEvent[this.lenamechamp]=='onchange') {
		SetValue(this.lenamechamp, '');
		v = '';
	}
	
	if( typeof v == "string" ) return v;
	return false;
} 

Mask.prototype.setGeneric = function (_v, _d){
	var v = _v, m = this.mask;
	var r = "x#*", rt = [], nv = "", t, x, a = [], j=0, rx = {"x": "A-Za-z", "#": "0-9", "*": "A-Za-z0-9" };

	// strip out invalid characters
	v = v.replace(new RegExp("[^" + rx["*"] + "]", "gi"), "");
	if( (_d == true) && (v.length == this.strippedValue.length) ) v = v.substring(0, v.length-1);
	this.strippedValue = v;
	var b=[];
	for( var i=0; i < m.length; i++ ){
		// grab the current character
		x = m.charAt(i);
		// check to see if current character is a mask, escape commands are not a mask character
		t = (r.indexOf(x) > -1);
		// if the current character is an escape command, then grab the next character
		if( x == "!" ) x = m.charAt(i++);
		// build a regex to test against
		if( (t && !this.allowPartial) || (t && this.allowPartial && (rt.length < v.length)) ) rt[rt.length] = "[" + rx[x] + "]";
		// build mask definition table
		a[a.length] = { "chr": x, "mask": t };
	}

	var hasOneValidChar = false;
	// if the regex fails, return an error
	if( !this.allowPartial && !(new RegExp(rt.join(""))).test(v) ) return this.throwError(1, "la valeur \"" + _v + "\" doit être au format  " + this.mask + ".", _v);
	// loop through the mask definition, and build the formatted string
	else if( (this.allowPartial && (v.length > 0)) || !this.allowPartial ){
		for( i=0; i < a.length; i++ ){
			if( a[i].mask ){
				while( v.length > 0 && !(new RegExp(rt[j])).test(v.charAt(j)) ) v = (v.length == 1) ? "" : v.substring(1);
				if( v.length > 0 ){
					nv += v.charAt(j);
					hasOneValidChar = true;
				}
				j++;
			} else nv += a[i].chr;
			if( this.allowPartial && (j > v.length) ) break;
		}
	}
	
	if( this.allowPartial && !hasOneValidChar ) nv = "";
	if( this.allowPartial ){
		if( nv.length < a.length ) this.nextValidChar = rx[a[nv.length].chr];
		else this.nextValidChar = null;
	}

	return nv; 
}

Mask.prototype.setNumber = function(_v, _d){
	if( _v.length == 0 ) return "";	
	//var v = String(_v).replace(/[^\d.-]*/gi, ""), m = this.mask;
	var v = String(_v).replace(/[,]/gi,'.').replace(/[^\d.-]*/gi, ""), m = this.mask;
	
	// make sure there's only one decimal point
	v = v.replace(/\./, "d").replace(/\./g, "").replace(/d/, ".");
	// check to see if an invalid mask operation has been entered
	if( !/^[\$]?((\$?[\+-]?([0#]{1,3},)?[0#]*(\.[0#]*)?)|([\+-]?\([\+-]?([0#]{1,3},)?[0#]*(\.[0#]*)?\)))$/.test(m) )
	return this.throwError(1, "Un masque invalide a été spécifié.", _v);

	if( (_d == true) && (v.length == this.strippedValue.length) ) v = v.substring(0, v.length-1);

	if( this.allowPartial && (v.replace(/[^0-9]/, "").length == 0) ) return v;
	this.strippedValue = v;

	if( v.length == 0 ){
		v = NaN;
	}
	var vn = Number(v);
	if( isNaN(vn) ) return this.throwError(2, "La valeur saisie n'est pas un nombre valide :", _v);
	

	// if no mask, stop processing
	if( m.length == 0 ) return v;

	// get the value before the decimal point
	var vi = String(Math.abs((v.indexOf(".") > -1 ) ? v.split(".")[0] : v));
	// get the value after the decimal point
	var vd = (v.indexOf(".") > -1) ? v.split(".")[1] : "";
	var _vd = vd;

	var isNegative = (vn != 0 && Math.abs(vn)*-1 == vn);
	
	//si le controle a été activé, on vérifie que le nombre ne soit pas négatif
	if(this.ctrlNbNegatif && isNegative){
		return this.throwError2(1, "La saisie d'un nombre négatif est interdite : " + v + ".",_v);
	}

	// check for masking operations
	var show = {
		"$" : /^[\$]/.test(m),
		"(": (isNegative && (m.indexOf("(") > -1)),
		"+" : ( (m.indexOf("+") != -1) && !isNegative )
	}
	show["-"] = (isNegative && (!show["("] || (m.indexOf("-") != -1)));


	// replace all non-place holders from the mask
	m = m.replace(/[^#0.,]*/gi, "");

	/*
		make sure there are the correct number of decimal places
	*/
	// get number of digits after decimal point in mask
	var dm = (m.indexOf(".") > -1 ) ? m.split(".")[1] : "";
	if( dm.length == 0 ){
		vi = String(Math.round(Number(vi)));
		vd = "";
	} else {
		// find the last zero, which indicates the minimum number
		// of decimal places to show
		var md = dm.lastIndexOf("0")+1;
		// if the number of decimal places is greater than the mask, then round off
		if( vd.length > dm.length ) {
			// on n'arrondi plus
			//vd = String(Math.round(Number(vd.substring(0, dm.length + 1))/10));
		}
		// otherwise, pad the string w/the required zeros
		else {
			while( vd.length < md ) vd += "0";
		}
	}

	/*
		pad the int with any necessary zeros
	*/
	// get number of digits before decimal point in mask
	var im = (m.indexOf(".") > -1 ) ? m.split(".")[0] : m;
	im = im.replace(/[^0#]+/gi, "");
	// find the first zero, which indicates the minimum length
	// that the value must be padded w/zeros
	var mv = im.indexOf("0")+1;
	// if there is a zero found, make sure it's padded
	if( mv > 0 ){
		mv = im.length - mv + 1;
		while( vi.length < mv ) vi = "0" + vi;
	}


	/*
		check to see if we need commas in the thousands place holder
	*/
	if( /[#0]+,[#0]{3}/.test(m) ){
		// add the commas as the place holder
		var x = [], i=0, n=Number(vi);
		while( n > 999 ){
			x[i] = "00" + String(n%1000);
			x[i] = x[i].substring(x[i].length - 3);
			n = Math.floor(n/1000);
			i++;
		}
		x[i] = String(n%1000);
		vi = x.reverse().join(",");
	}


	/*
		combine the new value together
	*/
	if( (vd.length > 0 && !this.allowPartial) || ((dm.length > 0) && this.allowPartial && (v.indexOf(".") > -1) && (_vd.length >= vd.length)) ){
		v = vi + "." + vd;
	} else if( (dm.length > 0) && this.allowPartial && (v.indexOf(".") > -1) && (_vd.length < vd.length) ){
		v = vi + "." + _vd;
	} else {
		v = vi;
	}

	if( show["$"] ) v = this.mask.replace(/(^[\$])(.+)/gi, "$") + v;
	if( show["+"] ) v = "+" + v;
	if( show["-"] ) v = "-" + v;
	if( show["("] ) v = "(" + v + ")";
	
	
	//si le controle est activé, on vérifie que le pourcentage ne dépasse pas 100,00
	if(this.ctrlPctg){
		//vi = the value before the decimal point
		//vd = the value after the decimal point
		if(vi > 100 || (vi == 100 && vd > 0)){
			return this.throwError2(1, "La valeur du pourcentage "+v+" ne peut excéder 100.",_v);
		}
		
	}
	
	/*
	*-ODO- check if number of digits before decimal is correct 
	* On applique tous les contr�les comme d'habitude.
	* Mais avant de retourner la valeur v, on v�rifie que la taille de la partie enti�re saisie 
	* n'est pas sup�rieure � celle sp�cifi�e dans le masque. 
	*/
	
	if(this.ctrlNombre==true) {
		// contr�le sur la partie enti�re
		//vi = the value before the decimal point
		//im = the number of digits before decimal point in mask
		//vd = the value after the decimal point
		if( vi.length > im.length ){
			if( dm.length > 0){
				return this.throwError2(1, "La partie entière du nombre "+v+" est limité à "+im.length+" chiffre(s) .",_v);
			}else{
				return this.throwError2(1, "Le nombre "+ v +"  est limité à "+im.length+" chiffre(s) .",_v);
			}
		}
		// contr�le sur la partie d�cimale	
		if( vd.length > dm.length){
			if( dm.length > 0){
				return this.throwError2(1, "La partie décimale du nombre "+v+" est limité à "+dm.length+" chiffre(s) .",_v);
			}
		}
	}
	
	return v;
}

Mask.prototype.setDate = function (_v){
	var v = _v ;
	var m = this.mask;
	var a, e, x, s;
	var mm = 0;
	var dd = 1;
	var yy = 0;
	
	if (trim(_v)=='') return '' ;
	// split mask into array, to see position of each day, month & year
	a = m.split(/[^mdy]+/);
	// split mask into array, to get delimiters
	s = m.split(/[mdy]+/);
	if(s.length > 0 &&  s[0].length == 0 ) s.splice(0, 1);
	ns6 = (document.getElementById && navigator.appName.indexOf("Netscape")>=0 )? true: false;

	if(s.length > 0 && ns6) s.splice(s.length-1,1);
	
	//Petit tour de pass pass...
	//Si le masque est jj.mm.yyyy ou jj/mm/yyyy et que 
	// la saisie est sur 10 caract�res alor on va ins�rer les . ou les / au bon endroit
	if(m.length==10 && (m=='dd.mm.yyyy' || m=='dd/mm/yyyy') && s.length==2 && v.length==8 && v.indexOf(".") < 0 && v.indexOf("/") < 0  ) {
		var tmpv=v.substring(0,2);
		tmpv+=s[0];
		tmpv+=v.substring(2,4);
		tmpv+=s[0];
		tmpv+=v.substring(4,8);
		v=tmpv;		
	} 
	else if(m.length==10 && (m=='dd.mm.yyyy' || m=='dd/mm/yyyy') && s.length==2 && v.length==7  && (v.indexOf(".") >= 0 || v.indexOf("/") >= 0 ) ) {
		var sep = v.indexOf(".") >= 0 ? v.indexOf(".") : v.indexOf("/");
		if(sep == 2 && parseInt(v.substring(3,5))>12){
			// 04.2012 05.2012 06-2012 02/2012 
			var tmpv= '01';
			tmpv+=s[0];
			tmpv+=v.substring(0,2);
			tmpv+=s[0];
			tmpv+=v.substring(3,7);
			v=tmpv;	
		}
	} 
	//Si le masque est jj.mm.yyyy ou jj/mm/yyyy et que 
	// la saisie est sur 8 caract�res alor on va ins�rer les . ou les / au bon endroit
	else if(m.length==10 && (m=='dd.mm.yyyy' || m=='dd/mm/yyyy') && s.length==2 && v.length==6  && v.indexOf(".") < 0 && v.indexOf("/") < 0 ) {
		if(parseInt(v.substring(2,4),"10")>12){
			// 042012 05.2012 06-2012 02/2012 
			var tmpv= '01';
			tmpv+=s[0];
			tmpv+=v.substring(0,2);
			tmpv+=s[0];
			tmpv+=v.substring(2,6);
			v=tmpv;	
		}else{
			var tmpv=v.substring(0,2);
			tmpv+=s[0];
			tmpv+=v.substring(2,4);
			tmpv+=s[0];
			tmpv+=v.substring(4,8);
			v=tmpv;
		}
	} 
	else if(m.length==10 && (m=='dd.mm.yyyy' || m=='dd/mm/yyyy') && s.length==2 && v.length==4  && v.indexOf(".") < 0 && v.indexOf("/") < 0 ) {
		var year=new Date().getFullYear();
		var month = parseInt(v.substring(2,4),"10");
		var day = parseInt(v.substring(0,2),"10");
		if((day<32 && month<13) && !(month == 2 && day>29)){
				// 0412 0511 3112
				v=day+s[0]+month+s[0]+year;	
		}
	} 
	else if(m.length==10 && (m=='dd.mm.yyyy' || m=='dd/mm/yyyy') && s.length==2 && v.length==5  && (v.indexOf(".") >= 0 || v.indexOf("/") >= 0 )) {
		var year=new Date().getFullYear();
		var sep = v.indexOf(".") >= 0 ? v.indexOf(".") : v.indexOf("/");
		if(sep == 2){
			var month = parseInt(v.substring(3,5),"10");
			var day = parseInt(v.substring(0,2),"10");
			if((day<32 && month<13) && !(month == 2 && day>29)){
				// 04.12 05/11 31.12
				v=day+s[0]+month+s[0]+year;	
			}
		}
	} 
	else if(m.length==7 && (m=='mm.yyyy' || m=='mm/yyyy') && s.length==1 && ( ( v.length==4 && v.indexOf(".") < 0 && v.indexOf("/") < 0) || v.length==6) ) {
		var tmpv=v.substring(0,2);
		tmpv+=s[0];
		tmpv+=v.substring(2,6);
		v=tmpv;
	}
	
	// convert the string into an array in which digits are together
	e = v.split(/[^0-9]/);

	for( var i=0; i < a.length; i++ ){
		x = a[i].charAt(0).toLowerCase();
		if( x == "m" ) mm = parseInt(e[i], 10)-1;
		else if( x == "d" ) dd = parseInt(e[i], 10);
		else if( x == "y" ) yy = parseInt(e[i], 10);
	}
	
	// if year is abbreviated, guess at the year
	if( String(yy).length < 3 ){
		yy = 2000 + yy;
		if( (new Date()).getFullYear()+20 < yy ) yy = yy - 100;
	}

	// create date object
	var d = new Date(yy, mm, dd);

	if( d.getDate() != dd ) return this.throwError(1, "La date saisie est incorrecte :", _v);
	else if( d.getMonth() != mm ) return this.throwError(2, "La date saisie est incorrecte :", _v);

	//Controle par rapport au premier jour du calendrier grégorien 15 octobre 1582
	if (d.getFullYear()<1582)	return this.throwError(2, "La date saisie est incorrecte :", _v);
	else if (d.getFullYear()==1582 && d.getMonth() <9)	return this.throwError(2, "La date saisie est incorrecte :", _v);
	else if (d.getFullYear()==1582 && d.getMonth() ==9 && d.getDate()<15) 	return this.throwError(2, "La date saisie est incorrecte :", _v);

	var nv = "";

	for( i=0; i < a.length; i++ ){
		x = a[i].charAt(0).toLowerCase();
		if( x == "m" ){
			mm++;
			if( a[i].length == 2 ){
				mm = "0" + mm;
				mm = mm.substring(mm.length-2);
			}
			nv += mm;
		} else if( x == "d" ){
			if( a[i].length == 2 ){
				dd = "0" + dd;
				dd = dd.substring(dd.length-2);
			}
			nv += dd;
		} else if( x == "y" ){
			if( a[i].length == 2 ) nv += d.getYear();
			else nv += d.getFullYear();
		}

		if( i < a.length-1 ) nv += s[i];
	}

	return nv;
}

Mask.prototype.setHour = function (_v, _is24autorised){
	var v = _v, m = this.mask;
	var a, e, x, s;
	var hh = 0;
	var mm = 0;
	
	if (trim(_v)=='') return '' ;
	
	if (_is24autorised==null) {
		_is24autorised = false;
	}
	
	var posDP= v.indexOf(":");
	var lg = v.length;
	var vtmp ="";
	if (posDP==-1) //pas de : dans la chaine de caract�re
	{
		switch( lg ){
		case 1: vtmp="0"+v+":00"; v= vtmp; break;
		case 2: vtmp=v+":00"; v= vtmp;  break;
		case 3: vtmp=v.substring(0,2)+":"+v.substring(2,3)+"0"; v= vtmp; break;
		case 4: vtmp=v.substring(0,2)+":"+v.substring(2,4); v= vtmp; break;
			//	case 5: v=v.substring(0,2)+":"+v.substring(3,5);v= vtmp; break;
		}
	}
	else{// : dans la chaine de caract�re le premier est pris en compte
		switch( posDP ){
		case 0: vtmp="00"; 
			if (v.length==1){vtmp= vtmp+v+"00";}
			if (v.length==2){vtmp=vtmp+v+"0";} 		
			if (v.length==3){vtmp=vtmp+v;} 		
			if (v.length>3){vtmp=vtmp+v.substring(0,3);} 		
			v= vtmp; break;
		case 1: vtmp="0";
			if (v.length==2){vtmp= vtmp+v+"00";}
			if (v.length==3){vtmp=vtmp+v+"0";} 		
			if (v.length==4){vtmp=vtmp+v;} 		
			if (v.length>4){vtmp=vtmp+v.substring(0,4);} 		
			v= vtmp; break;
		case 2: 
			if (v.length==3){vtmp=vtmp+v+"00"; v= vtmp;} 		
			if (v.length==4){vtmp=vtmp+v+"0"; v= vtmp;} 		
			break;
			
			//		case 3: v=v.substring(0,2)+v.substring(3); v= vtmp; break;
			//		case 4: v=v.substring(2)+"00"; v= vtmp; break;
		}
	}
	
	
	
	
	// split mask into array, to see position of each hour & minute
	a = m.split(/[^hm]+/);
	// split mask into array, to get delimiters
	s = m.split(/[hm]+/);
	// convert the string into an array in which digits are together
	e = v.split(/[^0-9]/);
	
	if( s[0].length == 0 ) s.splice(0, 1);

	for( var i=0; i < a.length; i++ ){
		x = a[i].charAt(0).toLowerCase();
		if( x == "h" ) hh = parseInt(e[i], 10);
		else if( x == "m" ) mm = parseInt(e[i], 10);
	}
	
	if (isNaN(mm)) {
		mm = 0;
	}

	// create date object
	var jour="01";
	if ( _is24autorised && hh==24 ){
		// le 24 ne sert QUE pour indiquer un minuit le lendemain
		mm = 0;
		jour="02";
	}
	
	var d = new Date("2000", "01", jour, hh, mm);

	if (isNaN(d)) return this.throwError(1, "L'heure saisie est incorrecte :", _v);
	else if( (hh!=24 && d.getHours() != hh) || (hh==24 && !_is24autorised) ) return this.throwError(1, "L'heure saisie est incorrecte :", _v);
	else if( d.getMinutes() != mm ) return this.throwError(2, "L'heure saisie est incorrecte :", _v);

	var nv = "";

	for( i=0; i < a.length; i++ ){
		x = a[i].charAt(0).toLowerCase();
		if( x == "m" ){
			if( a[i].length == 2 ){
				mm = "0" + mm;
				mm = mm.substring(mm.length-2);
			}
			nv += mm;
		} else if( x == "h" ){
			if( a[i].length == 2 ){
				hh = "0" + hh;
				hh = hh.substring(hh.length-2);
			}
			nv += hh;
		}

		if( i < a.length-1 ) nv += s[i];
	}

	return nv;
}

/*
 * Check if the duree contains a unique occurence of separators in list
 * @param dureeToCheck : string to check.
 */
function hasUniqueSeparator(dureeToCheck, separatorsList){
	
	var occursTab = new Array();

	if(separatorsList == null || separatorsList.length == 0) return true;
	
	var halt = false;
	for(separatorIndex = 0; separatorIndex < separatorsList.length; separatorIndex++){
		var separatorFirstIndex = dureeToCheck.indexOf(separatorsList[separatorIndex]);
		var separatorLastIndex = dureeToCheck.lastIndexOf(separatorsList[separatorIndex]);
		if(separatorLastIndex - separatorFirstIndex > 0) return false;
		else if(separatorFirstIndex >= 0){
			if(halt){
				return false;
			}else{
				halt = true;
			}
		}
	}

	return true;
}

/*
 * Set format ##h## to duree
 * @param _v : duree to format.
 */
Mask.prototype.setDuree = function (_v){
	
	var v = trim(_v), m = this.mask;
	var a, e, x, s;
	var hh = 0;
	var mm = 0;
	var signe = '';
	if (trim(_v)=='') return '' ;

	// controle sur le signe
	if( (v.indexOf("-")!=-1) || (v.indexOf("+")!=-1)){
		if(this.ctrlSigneDuree==true) {
			return this.throwError(1, "La saisie de signe n'est pas autorisée sur la durée :", _v);	
		}
		signe = v.substring(0,1);
		v = v.substring(1);
		if( (v.indexOf("-")!=-1) || (v.indexOf("+")!=-1)) {
			//test 2 fois le signe moins ou signe plus 
			return this.throwError(1, "La durée saisie est incorrecte :", _v);	
		}
	}	 
	
	var posDP= v.indexOf("h");
	var lg = v.length;
	var vtmp ="";

	// If duree value has a unique separator "." or ":"
	if(!hasUniqueSeparator(v,[".",":","h"])) 
		return this.throwError(1, "La durée saisie est incorrecte :", _v);	
	
	var separatorIndex = v.indexOf(".") >= 0 ? v.indexOf(".") : v.indexOf(":") >= 0 ? v.indexOf(":") : v.indexOf("h");
	

	// If separator ".", ":" or "h" exists in duree value
	if(separatorIndex >= 0){
		switch( lg ){
			// Case 1 : value like "." or ":" --> return 00h00
			case 1: vtmp="00h00";v= vtmp;break;
			
			// Case 2 : value like : 
			// "1." or "1:" --> return "01h00"
			// ".1" or ":1" --> return "00h10" 
			case 2: vtmp = separatorIndex == 0 ? "00h"+v.substring(1)+"0" : "0"+v.substring(0,1)+"h00"; v= vtmp;break;
			
			// Case 3 : value like :
			// ".15" or ":15" --> return "00h15"
			// "1.5" or "1:5" --> return "01h50"
			// "15." or "15:" --> return "15h00"
			case 3: vtmp = separatorIndex == 0 ? "00h"+ v.substring(1) : separatorIndex == 2 ? v.substring(0,2)+"h00" : "0" + v.substring(0,1) + "h" + v.substring(2) + "0";v= vtmp;break;
			
			// Case 4 : value like :
			// "1.25" or "1:25" --> return "01h25"
			// "12.5" or "12:5" --> return "12h50"
			case 4: vtmp = separatorIndex == 1 ? "0"+v.substring(0,1)+"h"+v.substring(2) : separatorIndex == 2 ? v.substring(0,2) + "h" + v.substring(3) + "0" : v ;v= vtmp;break;
			
			// Case 5 : value like :
			// "12.25" or "12:25" --> return "12h25"
			case 5: vtmp =  separatorIndex == 2 ? v.substring(0,2)+"h"+v.substring(3) : v ;v= vtmp;break;
		}
	// If duree value without separator
	}else{
		switch( lg ){
			// Case 1 : value like "1" --> return "01h00"
			case 1: vtmp="0"+v+"h00";v= vtmp;break;
			
			// Case 2 : value like "12" --> return value "12h00"
			case 2: vtmp=v+"h00";v= vtmp;break;
			
			// Case 3 : value like "123" --> return value "12h30"
			case 3: vtmp=v.substring(0,2)+"h"+v.substring(2)+"0";v= vtmp;break;
			
			// Case 4 : value like "1234" --> return value "12h34"
			case 4: vtmp=v.substring(0,2)+"h"+v.substring(2);v= vtmp;break;
		}
	}
	
	//Récupération des heures et des minutes
	if (v.length==5) {
		hh = v.substr(0,2);
		mm = v.substr(3,2);
		c = v.substr(2,1);
		if (c!='h') {
			return this.throwError(1, "La durée saisie est incorrecte :", _v);	
		}

		if (hh!=null) {
			h2 = parseInt(hh, 10);			
			if (h2 != hh) {
				return this.throwError(1, "Le nombre d'heures saisies est incorrect :", _v);
			}
		}
		else {
			return this.throwError(1, "Le nombre d'heures saisies est incorrect :", _v);
		}
		if (mm!=null) {
			m2 = parseInt(mm, 10);
			if (m2 != mm || m2 > 59) {
				return this.throwError(1, "Le nombre de minutes saisies est incorrect :", _v);
			}
		}
		else {
			return this.throwError(1, "Le nombre de minutes saisies est incorrect :", _v);
		}	
	}
	else {
		return this.throwError(1, "La durée saisie est incorrecte :", _v);
	}
	
	v = signe+v;
	return v;
	
	
	
	/*	
	// split mask into array, to see position of each hour & minute
	a = m.split(/[^hm]+/);
	// split mask into array, to get delimiters
	s = m.split(/[hm]+/);
	// convert the string into an array in which digits are together
	e = v.split(/[^0-9]/);
	
	if( s[0].length == 0 ) s.splice(0, 1);

	for( var i=0; i < a.length; i++ ){
		x = a[i].charAt(0).toLowerCase();
		if( x == "h" ) hh = parseInt(e[i], 10);
		else if( x == "m" ) mm = parseInt(e[i], 10);
	}
	

	
	if (isNaN(mm)) {
		mm = 0;
	}

	// create date object
	var d = new Date("2000", "01", "01", hh, mm);


	if (isNaN(d)) return this.throwError(1, "L'heure saisie est incorrecte :", _v);
	else if( d.getHours() != hh ) return this.throwError(1, "L'heure saisie est incorrecte :", _v);
	else if( d.getMinutes() != mm ) return this.throwError(2, "L'heure saisie est incorrecte :", _v);

	var nv = "";

	for( i=0; i < a.length; i++ ){
		x = a[i].charAt(0).toLowerCase();
		if( x == "m" ){
			if( a[i].length == 2 ){
				mm = "0" + mm;
				mm = mm.substring(mm.length-2);
			}
			nv += mm;
		} else if( x == "h" ){
			if( a[i].length == 2 ){
				hh = "0" + hh;
				hh = hh.substring(hh.length-2);
			}
			nv += hh;
		}

		if( i < a.length-1 ) nv += s[i];
	}

	return nv;
*/
}


Mask.prototype.setDateKeyPress = function (_v, _d){
	var v = _v, m = this.mask, k = v.charAt(v.length-1);
	var a, e, c, ml, vl, mm = "", dd = "", yy = "", x, p, z;

	if( _d == true ){
		while( (/[^0-9]/gi).test(v.charAt(v.length-1)) ) v = v.substring(0, v.length-1);
		if( (/[^0-9]/gi).test(this.strippedValue.charAt(this.strippedValue.length-1)) ) v = v.substring(0, v.length-1);
		if( v.length == 0 ) return "";
	}

	// split mask into array, to see position of each day, month & year
	a = m.split(/[^mdy]/);
	// split mask into array, to get delimiters
	s = m.split(/[mdy]+/);
	// mozilla wants to add an empty array element which needs removed
	if( s[0].length == 0 ) s.splice(0,1);
	// convert the string into an array in which digits are together
	e = v.split(/[^0-9]/);
	// position in mask
	p = (e.length > 0) ? e.length-1 : 0;
	// determine what mask value the user is currently entering
	c = a[p].charAt(0);
	// determine the length of the current mask value
	ml = a[p].length;

	for( var i=0; i < e.length; i++ ){
		x = a[i].charAt(0).toLowerCase();
		if( x == "m" ) mm = parseInt(e[i], 10)-1;
		else if( x == "d" ) dd = parseInt(e[i], 10);
		else if( x == "y" ) yy = parseInt(e[i], 10);
	}
	
	
	var nv = "";
	var j=0;

	for( i=0; i < e.length; i++ ){
		x = a[i].charAt(0).toLowerCase();
		
		if( x == "m" ){
			z = ((/[^0-9]/).test(k) && c == "m");
			mm++;
			if( (e[i].length == 2 && mm < 10) || (a[i].length == 2 && c != "m") || (mm > 1 && c == "m") || (z && a[i].length == 2) ){
				mm = "0" + mm;
				mm = mm.substring(mm.length-2);
			}
			vl = String(mm).length;
			ml = 2;
			nv += mm;
		} else if( x == "d" ){
			z = ((/[^0-9]/).test(k) && c == "d");
			if( (e[i].length == 2 && dd < 10) || (a[i].length == 2 && c != "d") || (dd > 3 && c == "d") || (z && a[i].length == 2) ){
				dd = "0" + dd;
				dd = dd.substring(dd.length-2);
			}
			vl = String(dd).length;
			ml = 2;
			nv += dd;
		} else if( x == "y" ){
			z = ((/[^0-9]/).test(k) && c == "y");
			if( c == "y" ) yy = String(yy);
			else {
				if( a[i].length == 2 ) yy = d.getYear();
				else yy = d.getFullYear();
			}
			if( (e[i].length == 2 && yy < 10) || (a[i].length == 2 && c != "y") || (z && a[i].length == 2) ){
				yy = "0" + yy;
				yy = yy.substring(yy.length-2);
			}
			ml = a[i].length;
			vl = String(yy).length;
			nv += yy;
		}

		if( ((ml == vl || z) && (x == c) && (i < s.length)) || (i < s.length && x != c ) ) nv += s[i];
	}

	if( nv.length > m.length ) nv = nv.substring(0, m.length);

	this.strippedValue = (nv == "NaN") ? "" : nv;

	return this.strippedValue;
}

function qEvent(e){
	// routine for NS, Opera, etc DOM browsers
	if( window.Event ){
		var isKeyPress = (e.type.substring(0,3) == "key");

		this.keyCode = (isKeyPress) ? parseInt(e.which, 10) : 0;
		this.button = (!isKeyPress) ? parseInt(e.which, 10) : 0;
		this.srcElement = e.target;
		this.type = e.type;
		this.x = e.pageX;
		this.y = e.pageY;
		this.screenX = e.screenX;
		this.screenY = e.screenY;
		if( document.layers ){
			this.altKey = ((e.modifiers & Event.ALT_MASK) > 0);
			this.ctrlKey = ((e.modifiers & Event.CONTROL_MASK) > 0);
			this.shiftKey = ((e.modifiers & Event.SHIFT_MASK) > 0);
			this.keyCode = this.translateKeyCode(this.keyCode);
		} else {
			this.altKey = e.altKey;
			this.ctrlKey = e.ctrlKey;
			this.shiftKey = e.shiftKey;
		}
		// routine for Internet Explorer DOM browsers
	} else {
		e = window.event;
		this.keyCode = parseInt(e.keyCode, 10);
		this.button = e.button;
		this.srcElement = e.srcElement;
		this.type = e.type;
		if( document.all ){
			this.x = e.clientX + document.body.scrollLeft;
			this.y = e.clientY + document.body.scrollTop;
		} else {
			this.x = e.clientX;
			this.y = e.clientY;
		}
		this.screenX = e.screenX;
		this.screenY = e.screenY;
		this.altKey = e.altKey;
		this.ctrlKey = e.ctrlKey;
		this.shiftKey = e.shiftKey;
	}
	if( this.button == 0 ){
		this.setKeyPressed(this.keyCode);
		this.keyChar = String.fromCharCode(this.keyCode);
	}
}

// this method will try to remap the keycodes so the keycode value
// returned will be consistent. this doesn't work for all cases,
// since some browsers don't always return a unique value for a
// key press.
qEvent.prototype.translateKeyCode = function (i){
	var l = {};
	// remap NS4 keycodes to IE/W3C keycodes
	if( !!document.layers ){
		if( this.keyCode > 96 && this.keyCode < 123 ) return this.keyCode - 32;
		l = {
96:192,126:192,33:49,64:50,35:51,36:52,37:53,94:54,38:55,42:56,40:57,41:48,92:220,124:220,125:221,
93:221,91:219,123:219,39:222,34:222,47:191,63:191,46:190,62:190,44:188,60:188,45:189,95:189,43:187,
61:187,59:186,58:186,
			"null": null
		}
	}
	return (!!l[i]) ? l[i] : i;
}

// try to determine the actual value of the key pressed
qEvent.prototype.setKP = function (i, s){
	this.keyPressedCode = i;
	this.keyNonChar = (typeof s == "string");
	this.keyPressed = (this.keyNonChar) ? s : String.fromCharCode(i);
	this.isNumeric = (parseInt(this.keyPressed, 10) == this.keyPressed);
	this.isAlpha = ((this.keyCode > 64 && this.keyCode < 91) && !this.altKey && !this.ctrlKey);
	return true;
}

// try to determine the actual value of the key pressed
qEvent.prototype.setKeyPressed = function (i){
	var b = this.shiftKey;
	if( !b && (i > 64 && i < 91) ) return this.setKP(i + 32);
	if( i > 95 && i < 106 ) return this.setKP(i - 48);
	
	switch( i ){
	case 49: case 51: case 52: case 53: if( b ) i = i - 16; break;
	case 50: if( b ) i = 64; break;
	case 54: if( b ) i = 94; break;
	case 55: if( b ) i = 38; break;
	case 56: if( b ) i = 42; break;
	case 57: if( b ) i = 40; break;
	case 48: if( b ) i = 41; break;
	case 192: if( b ) i = 126; else i = 96; break;
	case 189: if( b ) i = 95; else i = 45; break;
	case 187: if( b ) i = 43; else i = 61; break;
	case 220: if( b ) i = 124; else i = 92; break;
	case 221: if( b ) i = 125; else i = 93; break;
	case 219: if( b ) i = 123; else i = 91; break;
	case 222: if( b ) i = 34; else i = 39; break;
	case 186: if( b ) i = 58; else i = 59; break;
	case 191: if( b ) i = 63; else i = 47; break;
	case 190: if( b ) i = 62; else i = 46; break;
	case 188: if( b ) i = 60; else i = 44; break;

	case 106: case 57379: i = 42; break;
	case 107: case 57380: i = 43; break;
	case 109: case 57381: i = 45; break;
	case 110: i = 46; break;
	case 111: case 57378: i = 47; break;

	case 8: return this.setKP(i, "[backspace]");
	case 9: return this.setKP(i, "[tab]");
	case 13: return this.setKP(i, "[enter]");
	case 16: case 57389: return this.setKP(i, "[shift]");
	case 17: case 57390: return this.setKP(i, "[ctrl]");
	case 18: case 57388: return this.setKP(i, "[alt]");
	case 19: case 57402: return this.setKP(i, "[break]");
	case 20: return this.setKP(i, "[capslock]");
	case 32: return this.setKP(i, "[space]");
	case 91: return this.setKP(i, "[windows]");
	case 93: return this.setKP(i, "[properties]");

	case 33: case 57371: return this.setKP(i*-1, "[pgup]");
	case 34: case 57372: return this.setKP(i*-1, "[pgdown]");
	case 35: case 57370: return this.setKP(i*-1, "[end]");
	case 36: case 57369: return this.setKP(i*-1, "[home]");
	case 37: case 57375: return this.setKP(i*-1, "[left]");
	case 38: case 57373: return this.setKP(i*-1, "[up]");
	case 39: case 57376: return this.setKP(i*-1, "[right]");
	case 40: case 57374: return this.setKP(i*-1, "[down]");
	case 45: case 57382: return this.setKP(i*-1, "[insert]");
	case 46: case 57383: return this.setKP(i*-1, "[delete]");
	case 144: case 57400: return this.setKP(i*-1, "[numlock]");
	}
	
	if( i > 111 && i < 124 ) return this.setKP(i*-1, "[f" + (i-111) + "]");

	return this.setKP(i);
}

// define the addEvent(oElement, sEvent, sCmd, bAppend) function
function $addEvent(o, _e, c, _b){

	var e = _e.toLowerCase(), b = (typeof _b == "boolean") ? _b : true, x = (o[e]) ? o[e].toString() : "";
	
	
	// strip out the body of the function
	x = x.substring(x.indexOf("{")+1, x.lastIndexOf("}"));
	x = ((b) ? (x + c) : (c + x)) + "\n";
	
	return o[e] = (!!window.Event) ? new Function("event", x) : new Function(x);
}
function Maskdetach(p_obj) {
	if (p_obj!=null) p_obj.onblur =null;
}

function detecteOnChange(o) {
	if (o["onchange"]!=null) return true;
	return false ;
}
