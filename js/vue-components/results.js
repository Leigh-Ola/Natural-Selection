define(function(){

var Earth;

var resultsTab = {
	data : function(){ return {
		species : {}, duration : 0,
		isReady : false, loading : false,
		weeks : {}, week : 1, sim : {},
		progress : 0, playing : false
	}},
	components : {
		"loader" : _.loader
	},
	methods : {
		toggleStats :function(e, toggle){
			var button = e.target;
			button.innerHTML = (button.innerHTML.indexOf("hrink") > -1)? "Tap to expand" : "Tap to shrink" ;
			var el = (button.parentElement.parentElement);
			el.classList.toggle("full");
			if(toggle){
				this.$data.playing = !this.$data.playing;
			}
		},
		toggleProgress : function(e){
			if(e.target.parentElement.classList.contains("full")){
				this.$data.playing = !this.$data.playing;
			}
		},
		randomSpecimen : function(name){
			var specie = this.$data.species[name].data;
			if(specie.individuals.length < 1){ return; }
			var ind = specie.individuals[Math.floor(Math.random() *specie.individuals.length)];
			var keys = ["id","gender","age","isMature","health","lifespan","offence","parents","isPregnant","sexDrive","isPredator","maturity","pregnancy","hasCustomData"];
			var str = "<b>Random "+specie+" Specimen</b>\n\n";
			for(var i in keys){
				var ii = _.capitalize(keys[i], true);
				ii = (ii == "Pregnancy")? "Pregnancy Duration" : ii ;
 				ii = (ii == "SexDrive")? "Mating Drive" : ii ;
 				ii = (ii == "Id")? "I.D." : ii ;
				var item = (typeof item == "string")? _.capitalize(ind[keys[i]]) : String(ind[keys[i]]);
 				item = (ii == "Health")? _.decimalNumLen(item, 1) : item;
 				item = (item == "Undefined")? "None" : item ;
				str+=("<b>"+ii+"</b> : "+item+"\n");
			}
			this.$emit("show_popup", {
				text : str,
				option : "Close"
			});
		},
		changeWeek : function(){
			var self = this;
			if(!self.$data.playing){
				return;
			}
			self.$data.progress = 0;
			new anime({
				targets : self.$data,
				progress : 100,
				duration : 2400,
				delay : 0,
				easing : "linear",
				elasticity : 0
			});
			if(self.$data.week == 1){
				self.newWeek(self.$data.week);
			}
			setTimeout(function(){
				if(self.$data.week < self.$parent.$data.duration){
					self.newWeek(++self.$data.week);
					self.changeWeek();
				}
			},2500);
		},
		newWeek : function(w){
			var data = this.$data;
			var pop = data.weeks[w].population;
			var pops = [], max = 0, total = 0;
			for(var p in pop){
				pop[p] = Number(pop[p]);
				if(pop[p] > max){
					max = pop[p];
				}
				pops.push(pop[p]);
				total+=pop[p];
			}
			if(max == 0){
				this.createSimulation({})
				return;
			}
			var scales = [];
			for(var p in pops){
				if(pops[p] == 0){
					scales.push(0);
					continue;
				}
				var ans = ((total < 50)? pops[p] : Math.round(50 / (total / pops[p])));
				if(ans == 0){ ans = 1; }
				scales.push(ans);
			}
			
			var arg = {}, argInt = 0;
			for(var p in pop){
				arg[p]= scales[argInt++];
			}
			this.createSimulation(arg);
		},
		createSimulation :function(data){
			if(!Object.keys(data).length){
				this.$data.sim = {};
				return;
			}
			for(var s in data){
				this.$set(this.$data.sim, s, []);
				for(var i = 1; i <= data[s]; i++){
					this.$data.sim[s].push([_.randInt(96)+"%", _.randInt(96)+"%"]);
				}
			}
		},
		parse : function(){
			this.$data.species = {};
			var species = Earth.getSpecies();
			var curr;
			for(var s in species){
				if(!_.getTypeof(species[s], "function")){
					curr = species[s];
					var data = {
						data : curr, name : curr.toString(),
						growth : fetchGrowth(curr), initial : curr.stats.created,
						descendants : curr.stats.born, alive : curr.individuals.length,
						dead : (curr.count - curr.individuals.length),
						eaten : curr.stats.eaten, natural : (curr.stats.starved + curr.stats.aged)
					};
					data.state = (data.growth > 50)? "thriving" : ((data.growth > -100)? "endangered" : "extinct");
					this.$set(this.$data.species, _.capitalize(s), data);
				}
			}
			function fetchGrowth(species){
				var initial = species.stats.created, living = species.individuals.length;
				var ans = String(((living - initial) / initial) *100);
				return _.decimalNumLen(ans, 1);
			}
			
			var log = Earth.getLog(), weeks = {};
			for(var i in log){
				var week = log[i];
				if(week.indexOf("Week") > -1){
					var num = Number(week.split(" ")[1]);
					if(!weeks.hasOwnProperty(num)){			
						weeks[num] = { population : {} };
					}
					if(week.indexOf("alive") > -1){
						var n = /\d+([^:]+)individuals alive/.exec(week);
						n.shift();
						n = n.join(" ").trim();
						weeks[num].population[n] = Number(/:.*\d+/.exec(week)[0].substr(1));
					}else if(week.indexOf("extinct") > -1){
						var splitWeek = week.split(" ");
						var n = week.substring(week.indexOf("species"), week.indexOf(":")+1).trim();
						weeks[num].population[n] = 0;
					}
					if(week.indexOf("alive") < 0){
						if(!weeks[num].hasOwnProperty("log")){
							weeks[num].log = [];
						}
						week = week.split(" ");
						week = week.slice(3).join(" ");
						weeks[num].log.push(week);
					}
				}
			}
			
			var len = Number(Object.keys(weeks).length);
			while(len < this.$data.duration){
				len+=1;
				weeks[String(len)] = {};
			}
			
			this.$data.weeks = weeks;
			this.$data.isReady = true;
		},
		run : function(){
			
			//Create virtual world
			Earth = new World();
			var pSpecies = this.$parent.$data.species, species = [];
			for(var p in pSpecies){
				species.push(pSpecies[p]);
			}
			Earth.createSpecies(species);
			for(var s in species){
				Earth.createIndividuals(species[s].name.toLowerCase(), species[s].initial);
			}
			this.$data.duration = this.$parent.$data.duration;
			Earth.simulate(this.$data.duration);
			
			this.parse();
		}
	},
	watch : {
		"tab_level" :function(lvl){
			var pData = this.$parent.$data;
			if(!pData.refreshed){return;}
			pData.refreshed = false;
			this.isReady = false;
			this.$data.loading = true;
			pData.tabScrollable = false;
			var self = this;
			
			pData.afterScroll = function(){
				self.run();
				pData.tabScrollable = true;
				self.$data.loading = false;
			}
		},
		"playing" : function(cont){
			if(cont){
				if(this.$data.week >= this.$data.duration){
					this.$data.week = 1;
				}
				this.changeWeek();
			}
		}
	},
	props : ["tab_level"],
	template : '\
<div class="content showResults">\
	<div class="loaderBox" v-if="loading">\
		<loader></loader>\
	</div>\
	<div class="stats full" v-for="(specie, specieName) in species" v-if="isReady">\
		<div class="top show"><span>{{specie.name}}</span><span @click.stop="toggleStats($event)">Tap to shrink</span></div>\
		<div class="short show"><span :class="specie.state">{{specie.state}}</span> : <b>{{specie.growth}}%</b> growth</div>\
		<div class="statsBox">\
			<div class="itemList">\
				<span>Population</span>\
				<ul>\
					<li>Initial : <b>{{specie.initial}}</b></li>\
					<li>Descendants : <b>{{specie.descendants}}</b></li>\
					<li>Alive : <b>{{specie.alive}}</b></li>\
					<li>Dead : <b>{{specie.dead}}</b></li>\
				</ul>\
			</div>\
			<div class="itemList">\
				<span>Deaths</span>\
				<ul>\
					<li>Natural : <b>{{specie.natural}}</b></li>\
					<li>Eaten : <b>{{specie.eaten}}</b></li>\
				</ul>\
			</div>\
		</div>\
		<div class="showRandom" @click="randomSpecimen(specieName)" v-if="specie.alive > 0">Show Specimen</div>\
	</div>\
	\
	<div class="simulation" v-if="isReady">\
		<div class="top show"><span>Simulator</span><span @click.stop="toggleStats($event, true)">Tap to expand</span></div>\
		<div class="sims show" @click.stop="toggleProgress($event)">\
			<template v-for="(specie, specieName) in sim">\
				<template v-for="indPos in specie">\
				<span v-bind:style="{top : indPos[0], left : indPos[1] }">{{specieName}}</span>\
				</template>\
			</template>\
			<div v-bind:style="{width : progress+\'%\'}"></div>\
		</div>\
		<div class="extra">\
			<h4>Week {{week}}</h4>\
			<div class="species itemList">\
				<span>Population</span>\
				<nav class="noBar"><span v-for="(num, name) in weeks[week].population">{{name}} : {{num}}</span></nav>\
			</div>\
			<div class="log itemList">\
				<span>Log</span>\
				<nav class="log noBar"><span v-for="item in weeks[week].log">{{item}}</span></nav>\
			</div>\
		</div>\
	</div>\
</div>'
}

return resultsTab;
});
// growth formula : ((living - initial) / initial) *100