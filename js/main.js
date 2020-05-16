var anim;
var _;

//{ type : "prey", name : "Rat", lifespan:5, health:4, maturity: 1, kids:6, offence: 10, sexDrive: 40, pregnancy: 1, initial: 10, isPredator : false, customData : {	Color : ["White", "Brown", "Black"], LongTail : ["True", "False"]} 	

function initialize(){

var components = {}

function loadComponents(loadVueObj){
	require(["comp/specieProp", "comp/newSpecie", "comp/popup", "comp/predictions", "comp/results"], function(sP, nS, popup, predict, results){
		components.specieProp = sP;
		components.specieTab = nS;
		components.popupTab = popup;
		components.predictionTab = predict;
		components.resultsTab = results;
		loadVueObj.call(window);
	});
}

loadComponents(function(){

	require(["extras/animatables"], function(anim){
		window.anim = anim;
	});

	var app = new Vue({
		el : ".app",
		components : {
			"specie" : components.specieProp,
			"specie-tab" : components.specieTab,
			"popup-tab" : components.popupTab,
			"prediction-tab" : components.predictionTab,
			"results-tab" : components.resultsTab
		},
		/**/
		data : {
			species : {},
			duration : 10,
			refreshed : true,
			
			displayedSpecie :{
				name : "", count : 0
			},
			
			popupData : {
				show : false, text : "",
				showRange : false,
				range : [],
				option : "",
				func : function(){}
			},
			
			predictionData : {
				changed : false,
				showing : false
			},
			
			tabLevel : 1,
			tabScrollable : false,
			afterScroll : undefined
		},
		/**/
		methods : {
			togglePopup : function(data){
				var data = (typeof data == "object")? data : { text : data };
				if(!data.callback){
					data.callback = function(){};
				}
				if(!data.option){
					data.option = "";
				}
				data.range = (_.contains(data, "range"))? data.range : [] ;
				this.$set(this.$data.popupData, "text", data.text);
				this.$set(this.$data.popupData, "option", data.option);
				this.$set(this.$data.popupData, "callback", data.callback);
				this.$set( this.$data.popupData, "range", data.range);
				this.$set( this.$data.popupData, "showRange", data.showRange);
				this.$set( this.$data.popupData, "show", true);
			},
			restart : function(){
				if(!Object.keys(this.$data.species).length){ return; }
				var self = this;
				this.togglePopup({
					text : "Are you sure you want to delete all the species?",
					option : "Yes",
					callback : function(yes){
						if(yes){
							self.$data.species = {};
							self.$data.tabLevel = 0;
						}
					}
				});
			},
			showSpecieSettings : function(name){
				if(name == undefined && Object.keys(this.$data.species).length >= 50){
					this.togglePopup({
						text : "You cannot create more than 50 species"
					});
					return;
				}

				if(this.$data.displayedSpecie.count == 0){
					this.togglePopup("To see a tip about any value, simply click the value name.\n\nSpecie Name is required.");
				}
				var curr = this.$data.species[name];
				if(name !== undefined){
					var d = _.cloneObj(curr);
				}else{
					var d = _.getSpecieTemplate();
					name = this.uniqueNewSpecieName();
					d.name = name;
					d.isTemp = true;
					d.id = (new Date()).getTime();
				}
				
				this.$set(this.$data.species, name, d);
				this.$data.displayedSpecie.count++;
				this.$set(this.$data.displayedSpecie, "name", name);

				var maximizeNewSpecieTab = anim.maximizeNewSpecieTab;
				if(maximizeNewSpecieTab.reversed){
					maximizeNewSpecieTab.reverse();
				}
				maximizeNewSpecieTab.play(); 
			},
			saveSpecieSettings : function(newD){
				this.$delete(this.$data.species, this.$data.displayedSpecie.name);
				this.$set(this.$data.species, newD.name, newD);
				this.updateAllTypes();
			},
			deleteSpecieSettings : function(d){
				this.$delete(this.$data.species, d.name);
				this.updateAllTypes();
			},
			uniqueNewSpecieName : function(){
				var species = this.$data.species, count = 0;
				for(var i in species){
					if(i.toLowerCase().indexOf("new specie") == 0){ count++; }
				}
				return ("New Specie"+((count)? " "+count : "" ));
			},
			updateAllTypes : function(){
				for(var s in this.$data.species){
					var sData = this.$data.species[s];
					var type = (this.allPrey.indexOf(sData.name) > -1)? "prey" : "" ;
					type = (sData.isPredator)? ((type == "prey")? "predatorPrey" : "predator") : type ;
					sData.type = type;
				}
				// ^ Wont update species that have not been saved.
			},
			usePreset : function(){
				var self = this;
				require(["extras/presets"], function(presets){
					for(var i in presets){
						self.$set(self.$data.species, presets[i].name, presets[i]);
					}
				});
			},
			fetchDuration : function(){
				if(!Object.keys(this.$data.species).length){
					this.togglePopup("You have not created any species yet.");
					return;
				}
				var self = this;
				this.togglePopup({
					text : "For how many weeks should the simulation run?",
					option : "Save",
					showRange : true,
					range : [3,100],
					callback : saveDuration
				});
				function saveDuration(d){
					if(!d){ return; }
					self.$data.duration = d;
 					self.$set(self.$data.predictionData, "changed", true);
					self.$set(self.$data.predictionData,  "showing", true);

				}
			},
			/**/
			showResults : function(){
				this.$data.refreshed  = true;
				this.$data.tabScrollable = true;
				this.$data.tabLevel = 2;
			}
		},
		/**/
		computed : {
			allCustomPrefs : function(){
				var ans = {};
				var species = this.$data.species;
				for(var s in species){
					var cd = species[s].customData;
					for(var c in cd){
						if(_.contains(ans, c)){
							for(var i in cd[c]){
								if(ans[c].indexOf(cd[c][i]) < 0){
									ans[c].push(cd[c][i]);
								}
							}
						}else{
							ans[c] = _.cloneArr(cd[c]);
						}
					}
				}
				return ans;
			},
			allPrey : function(){
				var s = this.$data.species, ans = [];
				for(var i in s){
					var prey = s[i].prey;
					for(var p in prey){
						if(ans.indexOf(prey[p]) < 0){ 	ans.push(prey[p]); }
					}
				}
				return ans;
			}
		},
		/**/
		mounted : function(){
			var self = this;
			this.togglePopup({
				text : "Would you like to load the preset species?",
				option : "Yes",
				callback : function(yes){
					if(yes){
					   self.usePreset();
					}
				}
			});
			_.scrollHandler.start(this.$data);
			
			var el = document.querySelector(".contentBox");
			el.addEventListener("scroll", function(e){
				if(!self.$data.tabScrollable){
					e.preventDefault;
					el.scrollLeft = 0;
				}
			});
		},
		watch : {
			"tabLevel" : function(val){
				if(!this.$data.tabScrollable){ return; }
				var self = this;
				var el = document.querySelector(".contentBox");
				var destination = ((val <=1)? 0 : el.clientWidth);
				new anime({
					targets : el,
					duration : 500,
					easing : "easeOutSine",
					scrollLeft : destination,
					complete : function(){
						el.scrollLeft = destination;
						if(val == 0){
							self.$data.tabScrollable = false;
						}
						if(typeof self.$data.afterScroll == "function"){
							self.$data.afterScroll.call(self);
							self.$data.afterScroll = undefined;
						}
					}
				});
			}
		}
	});

});

}//end of attachMethods()



require.config({
    baseUrl: "js",
    waitSeconds : 1,
    paths : {
        comp: "vue-components",
        data : "../data"
    }
 });

require(["extras/utilities"], function(utils, coolClick){
	 window._ = utils;
	 initialize();
})


/*
TODO :
	Create ShowResults Tab
	Merge it all
*/