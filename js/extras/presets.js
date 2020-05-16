define(function(){
	return [
	{ type : "prey", name : "Rat", lifespan:8, health:3, maturity: 1, kids:6, offence: 10, sexDrive: 99, pregnancy: 1, initial: 20, isPredator : false,
	customData : {	Color : ["White", "Brown", "Black"], LongTail : ["True", "False"]},	
	id : 1	},//rat

	{ type : "predatorPrey", name : "Snake", lifespan:11, health:7, maturity: 2, kids:5, offence: 91, sexDrive: 97, pregnancy: 4, isPredator : true, initial: 8, prey : ["Rat"], 
	customPrefs : {Color:"Black"},
	customData : {	Color : ["Grey","Black","Mixed","Brown","Ash","Green"],	LongTail : ["True","False"]	},
	id : 2 },//snake

	{ type : "predator", name : "Eagle", lifespan:20, health:5, maturity: 2, kids:3, offence: 61, sexDrive: 89, pregnancy: 3, initial: 7, isPredator : true, prey : ["Snake", "Rat"],
	customPrefs : {LongTail:"True", Color:"Mixed"},
	customData : {	Color : ["Grey","Black","Mixed","Brown","Ash"]	},
	id : 3 }//eagle
	];
});