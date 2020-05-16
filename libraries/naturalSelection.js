function World(){
	var species = {};
	var time = 0;
	
	function log(){
		var log = [];
		var knownSpecies = Object.keys(species), knownCustomData = {};
		getSpecies().eachSpecies(function(){
			log.push(this+" species is created");
			knownCustomData[this] = {};
			for(var c in this.stats.customData){
				knownCustomData[this][c] = [];
				for(var d in this.stats.customData[c]){
					knownCustomData[this][c].push(d);
				}
			}
		});
		
		var update = function(){
			var extinct = [];
			
			for(var s in knownSpecies){
				var specie = species[knownSpecies[s]];
				var currentKnownCustomData = knownCustomData[specie];
				if(specie.individuals.length < 1){
					log.push("Week "+time+" : "+specie+" species has gone extinct");
 					extinct.push(knownSpecies[s]);
				}else{
					log.push("Week "+time+" : "+specie.individuals.length+" "+specie+" individuals alive");
				}
				var customData = specie.stats.customData;
				for(var c in customData){
					for(var d in customData[c]){
						if(customData[c][d] < 1 && (currentKnownCustomData[c].indexOf(d) > -1)){
							knownCustomData[specie][c].splice(currentKnownCustomData[c].indexOf(d), 1);
							if(specie.stats.born == 0){ continue; }	
							log.push("Week "+time+" : All "+specie+" individuals with '"+c+" = "+d+"' are dead");
						}
					}
				}
			}
			for(var e in extinct){
				knownSpecies.splice(knownSpecies.indexOf(extinct[e]),1);
			}
		}
		var fetch = function(){
			return log;
		}
		return {
			fetch : fetch,
			update : update
		}
	}
	var Log;
	
	
	function createIndividuals(specie, amount){
		if(getType(specie) != "string"){
			return throwException("First argument for function createIndividuals must be a string");
		}
		var amount = (isNaN(Number(amount)))? 2 : amount ;
		for(var i = 1; i<=amount; i++){
			createIndividual(specie);
		}
	}
	
	function createIndividual(specie, dna){
		if(!species[specie]){
			throwException("Trying to create individual in '"+specie+"' species. \n"+capitalize(specie)+" species not found.");
			return;
		}
		var indSpecie = species[specie];
		var ind = Object.create(species[specie]);
		var allInds = species[specie].individuals;
		var dna = (dna === undefined)? {} : dna ;
		ind.id = ++getSpecie(ind).count;
		ind.gender = (function(){
			if(ind.males > ind.females){
				getSpecie(ind).females++;
				return "female";
			}
			getSpecie(ind).males++;
			return "male";
		})();
		ind.age = 0;
		ind.isMature = false;
		
		ind.health = ind.avgHealth;
		ind.lifespan = randFuzzyInt(ind.avgLifespan, 1);
		ind.offence = randFuzzyInt(ind.avgOffence, 1);
		for(var cc in ind.customData){
			var cd = randChoice(ind.customData[cc]);
			ind[cc] = cd;
		}
		for(var d in dna){
			ind[d] = dna[d];
		}
		for(var cc in ind.customData){
			species[specie].stats.customData[cc][ind[cc]]+=1;
		}
		if(!Object.keys(dna).length){
			species[specie].stats.created++
		}
		
		(function create(){
			ind.name = ind.toString =  function(){ return (specie+ind.id); }
			allInds.push(ind);
			species[specie].individuals = allInds;
 		})();
	}
	
	function createSpecies(list){
		if(getType(list) != "array"){
			return throwException("Argument for function createSpecies must be an array");
		}
		for(var l in list){
			if(!species[list[l].name]){
				createSpecie(list[l]);
			}else{
				throwException("Species '"+capitalize(list[l].name)+"' already exists");
			}
		}
		Log = log();
	}
	
	function createSpecie(attr){
		var name=attr.name.toLowerCase();
		var inheritables = ["lifespan","offence"];
		for(var i in attr.customData){
			inheritables.push(i);
		}
		for(var p in attr.prey){
			attr.prey[p] = attr.prey[p].toLowerCase();
		}
		var customData = {};
		var hasCustomData = (Object.keys(attr.customData).toString() != "");
		if(hasCustomData){
			for(var ckey in attr.customData){
				customData[ckey] = {};
				for(var cval in attr.customData[ckey]){
					customData[ckey][attr.customData[ckey][cval]] = 0;
				}
			}
		}
		var specie = {
			specieName : name,
			toString : function(){
				return capitalize(name)
			},
			count : 0,
			males : 0,
			females : 0,
			isPredator : attr.isPredator,
			maturity : attr.maturity,
			avgHealth : attr.health,
			isPregnant : false,
			pregnancy : attr.pregnancy,
			avgKids : attr.kids,
			avgLifespan : attr.lifespan,
			avgOffence : attr.offence,
			sexDrive : attr.sexDrive/2,
			customData : attr.customData,
			hasCustomData :hasCustomData,
			inheritable : inheritables,
			preference : attr.customPrefs,
			prey : attr.prey,
			getOlder : function(num){
				getOlder.call(this, num);
			},
			stats : {
				created : 0, born : 0, starved : 0, aged : 0, eaten : 0,
				customData : customData
			},
			individuals : [],
			eachIndividual : function(x){
				var inds=this.individuals
				for(var i in inds){
					if(inds[i]){
						x.call(inds[i]);
					}
				}
				return this.individuals;
			}
		}
		species[name] = specie;
		return species[name];
	}
	
	/* The following inner functions are only available to each individual. */
	function getOlder(num){
		this.age+=( num == undefined)? 1 : num ;
		feed.call(this);
		if(this.isPregnant){
			this.pregnancyLength--;
		}
		if(this.pregnancyLength < 1){
			giveBirth.call(this);
		}
		var isEndangered =(this.count<10)
		if(this.age >= this.maturity){
			this.isMature = true;
			if(this.gender == "male" && rand(((isEndangered)? this.sexDrive*2 : this.sexDrive)+"%")){
				mate.call(this);
			}
		}
		if(this.age > this.lifespan){
			getSpecie(this).stats.aged++;
			die.call(this);
		}else if(this.health <= 0){
			getSpecie(this).stats.starved++;
			die.call(this);
		}
	}
	
	function feed(hasFed){
		var hasFed = (hasFed === true)? true : false ;
		if(!this.isPredator){
			var specie = getSpecie(this);
			var isEndangered = (this.count < 6);
			var x = specie.avgHealth / 3;
			if(rand(((isEndangered)? 80 : 70)+"%")){
				this.health = ((this.health + x) > specie.avgHealth)? specie.avgHealth : (this.health + x) ;
			}else{
				this.health -= x;
			}
		}else{
			if(!rand(this.offence+"%")){
				this.health -= (getSpecie(this).avgHealth / 5);
				return;
			}
			var eatable = this.prey;
			if(!String(eatable)){
				for(var i in species){
					if(i != this.specieName){
						eatable.push(i);
					}
				}
			}
			if(!eatable.length){
			/*	if(rand("80%")){
					this.health += (getSpecie(this).avgHealth / 10);
				}*/
				return;
			}
			var catchable = [];
			while(catchable.length < 10){
			//	try{
			var individual = randChoice( species[ randChoice(eatable) ].individuals );
			//	}catch(e){
			//		this.health += (getSpecie(this).avgHealth / 10);
					// catch block for development and testing only. Prevents error (and reduction on health) whenever prey isnt found.
			//		return;
			//	}
				if(!individual){return;}
				if(individual.name() != this.name()){
					catchable.push(individual);
				}
			}
			var victim;
			for(var c in catchable){
				var pref =this.preference
				for(var p in pref){
					if(catchable[c][p] == pref[p]){
						victim = catchable[c];
						break;
					}
				}
			}
			if(victim === undefined){
				victim = randChoice(catchable);
			}
			getSpecie(victim).stats.eaten++;
			die.call(victim);
		}
	}
	
	function mate(){
		var curr = this;
		var inds = getSpecie(curr).individuals, mate = false;
		for(var i in inds){
			var ind = inds[i];
			if((ind.isMature) && (ind.gender == "female") && (ind.id != this.id) && (!ind.isPregnant)){
				mate = ind;
				break;
			}
		}
		if(mate == false){
			return;
		}
		mate.kids = (mate.kids)? mate.kids : randFuzzyInt(mate.avgKids, 1);
		var kids = [];
		function haveSex(){
			var genes = curr.inheritable;
			var kid = {};
			for(var g in genes){
				kid[genes[g]] = randChoice([(isNaN(Number(curr[genes[g]])))? curr[genes[g]] : randFuzzyInt(curr[genes[g]], 1), (isNaN(Number(mate[genes[g]])))? mate[genes[g]] : randFuzzyInt(mate[genes[g]], 1)]);
			}
			kid.parents = [curr, mate];
			kids.push(kid);
		}
		for(var i =1; i<=mate.kids; i++){
			haveSex();
		}
		mate.children = kids;
		mate.isPregnant = true;
		mate.pregnancyLength = this.pregnancy;
		curr.sexDrive = (curr.sexDrive < 1)? 0 : curr.sexDrive - 10;
		mate.sexDrive = (mate.sexDrive < 1)? 0 : mate.sexDrive - 10;
	}
	
	function giveBirth(){
		var count = this.children.length;
		for(var i = 1; i<=count; i++){
			createIndividual(this.specieName, this.children[i-1]);
			getSpecie(this).stats.born++;
		}
		this.isPregnant = false;
		this.children = undefined;
		this.pregnancyLength = undefined;
	}
	
	function die(){
		var specie = getSpecie(this);
		for(var cc in specie.customData){
			specie.stats.customData[cc][this[cc]]-=1;
		}
		var inds = specie.individuals;
		for(var i in inds){
			if(inds[i].id == this.id){
				inds.splice(i, 1);
				break;
			}
		}
	}
	
	
	var simulate = function(t){
		var species = getSpecies();
		for(var i = 1; i<=t; i++){
			time++;
			species.eachSpecies(function(){
				this.eachIndividual(function(){
					this.getOlder();
				});
			});
			Log.update();
		}
	}
	
	function getSpecies(){
		var tempSpecies = Object.create(species);
		tempSpecies.eachSpecies =function(x){
			for(var s in species){
				x.call(species[s]);
			}
		}
		return tempSpecies;
	}
	
	function getSpecie(individual){
		return species[individual.specieName];
	}
	
	function getLog(){
		return Log.fetch();
	}
	
	/*Functions below here are to avoid repetition and are not directly involved in the management of the virtual world */
	function throwException(msg, logMsg){
		var logMsg = (logMsg === false)? false : true ;
		try{
			throw msg
		}catch(e){
			if(logMsg){ console.log(e); }
		}
	}
	
	function capitalize(txt){
		var txt = String(txt);
		return (txt.charAt(0).toUpperCase()+txt.substr(1).toLowerCase());
	}
	
	function getType(item){
		return ( String(item.constructor).indexOf("rray") > -1 )? "array" : (typeof item);
	}
	
	function randChoice(lst){
		return lst[Math.floor( Math.random() *lst.length)];
	}
	
	function randFuzzyInt(num, amt){
		var num = Number(num);
		var amt =(amt === undefined)? 3: amt;
		for(var i = 1; i <= amt; i++){
			num = (randChoice([num-1, num+1]));
		}
		return num;
	}
	
	function rand(x, y){
		x = x.toString();
		if(x.indexOf("%") >= 0 && !isNaN(Number(0, x.substr(x.length - 1)))){
			x = x.substr(0, x.length - 1);
			var rand = Math.floor(Math.random() *101);
			return (rand <= x);
		}
		if(isNaN(Number(x)) || isNaN(Number(y)) && y !== undefined){
			return NaN;
		}
		x = Number(x)
		y = (y === undefined)? 0 : y ;
		var rand = Math.floor(Math.random() *x +y)
		return rand	
	}
	
	return {
	 createIndividuals:createIndividuals,
	 createSpecies: createSpecies,
	 getSpecies: getSpecies,
	 getLog: getLog,
	 simulate: simulate
	};
}
//Some tweaks have been made, to handle invalid data during testing for the prediction AI.