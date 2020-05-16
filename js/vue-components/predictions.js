define(function(require){

var predictions = {
	components : { "loader" : _.loader },
	data : function(){ return {
		showTab : false,
		showPredictions : false,
		overpopulation : [], extinction : [],
		predictions : {},
		gottenPredictions : false,
		bot : undefined
	}},
	methods : {
		getAIData : function(specie, amount, time){
			var ans = [];
			var params = ["lifespan","health","maturity","kids","sexDrive","pregnancy","offence","isPredator"];
		
			function convertNumber(num, min){
				var num = String(num);
				if(num.length > min.length){	return 1;	}
				return Number("0."+(min.substr(0, min.length-num.length)+num));
			}
			function convertBoolean(bool){	return Number(bool);	}
			for(var i in params){
				var temp = (typeof specie[params[i]] == "number")? convertNumber(specie[params[i]], "000") : convertBoolean(specie[params[i]]) ;
				ans.push(temp);
			}
			ans.push(convertNumber(amount,"00"));
			ans.push(convertNumber(time, "00"));
			return ans;
		},
		
		predict : function(species, dur){
			if(!this.$parent.$data.duration){	return; }
			var duration = this.$parent.$data.duration;
			for(var i in species){
				var inputData = this.getAIData(species[i], species[i].initial, duration);
 				var outputData = (this.$data.bot(inputData)[0]);
				var num = _.decimalLen(outputData, 4);
				if(num < 500){
					this.$data.extinction.push(i);
					this.$set(this.$data.predictions, i, "<b>Less Than</b> 500");
				}else if(num > 9900){
					this.$data.overpopulation.push(i);
					this.$set(this.$data.predictions, i, "<b>Over</b> 10,000");
				}else{
					var range = _.getRange(num, 100);
					this.$set(this.$data.predictions, i, range[0]+" - "+range[1]);
				}
			}
		},
		
		proceed : function(){
			var self = this;
			var opLen = this.$data.overpopulation.length;
			var overPopulated = (opLen > 0);
			var opStr = (opLen == 1)? "One" : "Several";
			opStr = (opLen == 2)? "Two" : opStr ;
			if(overPopulated){
				this.$emit("show_popup", {
					text : opStr+" of the species you created "+(opStr == "One"? "is" : "are")+" predicted to grow to over 10,000 individuals.\n\nThis may lead to a long loading time, as the simulator tries to create thousands of individuals.\n\nYou can still go back and edit any specie, making it less reproductive.\n\nAre you sure you want to proceed?",
					option : "Proceed",
					callback : function(yes){
						self.hideTab();
						if(yes){
							self.$emit("proceed");
						}
					}
				});
			}else{
				self.hideTab();
				self.$emit("proceed");
			}
		},
		
		hideTab : function(){
			this.$props.data.showing = false;
			this.$data.showTab = false;
		}
	},
	watch : {
		"data.showing" : function(val){
			if(!val){ return; }
			var mData = this.$data, pData = this.$props.data, self = this;
			this.$data.showTab = true;
			setTimeout(function(){
				document.querySelector(".predictionTab .predictions").scrollTop = 0;
				self.$data.showPredictions = true;
			}, 1500);
		},
		"data.changed" : function(val){
			if(!val){ return; }
			if(typeof this.$data.bot != "function"){
				return;
			}
			if(!Object.keys(this.$parent.$data.species).length){ return; }
			this.$data.showPredictions = false;
			this.$data.predictions = {};
			this.$data.overpopulation = [];
			this.$data.extinction = [];
			this.$props.data.changed = false;
			this.predict(this.$parent.$data.species, this.$parent.$data.duration);
		}
	},
	props : ["data"],
	mounted : function(){
		var self = this;
		require(['data/predictor','../libraries/Synaptic/synaptic.js'], function(bot_in_JSON, synaptic){
			var bot_as_standalone_network = synaptic.Network.fromJSON(bot_in_JSON).standalone();
			self.$data.bot = bot_as_standalone_network;
			self.$props.data.changed = 1;
		});
	},
	template : '\
	<div class="predictionTab" v-show="showTab" v-on:click="hideTab()">\
\
		<div class="thinking" v-on:click.stop="" v-if="!showPredictions">\
			<div><loader></loader></div>\
			<small>ML powered by <code>Synaptic.JS</code></small>\
		</div>\
\
		<div class="predictions noBar" :class="[showPredictions? \'show\' : \'\']" v-on:click.stop="">\
			<h3><i class="fa fa-arrow-left" @click.stop="hideTab()"></i><span>Predictions</span></h3>\
\
			<div class="noFuzzy" v-if="!overpopulation.length && !extinction.length">There are no species at risk of overpopulation or extinction.</div>\
\
			<div class="fuzzy" v-if="overpopulation.length">\
				<b>Overpopulation</b>\
				<span>The following species are <em>likely</em> to get out of control and overpopulate the simulation.</span>\
				<div class="specieList">\
					<span v-for="specie in overpopulation">{{specie}}</span>\
				</div>\
			</div>\
			<div class="fuzzy" v-if="extinction.length">\
				<b>Extinction</b>\
				<span>The following species are <em>likely</em> to become endangered, or go extinct.</span>\
				<div class="specieList">\
					<span v-for="specie in extinction">{{specie}}</span>\
				</div>\
			</div>'+'\
\
			<div class="exactBox" v-if="Object.keys(predictions).length">\
				<div class="exact">\
					<span>Exact predictions of the population of each species :</span>\
					<div class="exactSpecie" v-for="(prediction, specie) in predictions">\
						<span>{{specie}}</span><span v-html="prediction"></span>\
					</div>\
				</div>\
				<div class="info">\
					<p>Note that there are several factors that could affect the accuracy of these predictions.<p></p>For example, even if a predatory species is well equipped to be overpopulated, it may go extinct, if it\'s prey is scarce or extinct.</p>\
				</div>\
			</div>'+'\
			<div class="buttonBox" @click="proceed()">\
				<button>Proceed</button>\
			</div>\
		</div>\
	</div>\
	'
}

return predictions;

});