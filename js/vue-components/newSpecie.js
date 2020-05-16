define(function(require){

var specieTab = {
	data : function(){ return {
		minMax : {
			lifespan : [2,100], health : [2,30], maturity : [1, 50], kids : [1, 20], offence : [25,99], sexDrive : [25, 99], pregnancy : [1, 50], initial : [5, 30]
		},
		header : "", name : "",
		prey : [], customPrefs : {},
		lifespan : 0, health:0, maturity: 0, kids:0, offence: 0, sexDrive: 0, pregnancy: 0, initial : 0, isPredator : false,
		settings : {}, id : 0,
		customData : {}, tempCDItem : {},
		allSpecieNames : []
	}},
	methods : {
		exists : function(x){
			var y = (typeof x == "object")? Object.keys(x).length : x ;
			return (typeof x == "boolean")? true : Boolean(y);
		},
		toggleHint : function(e){
			e.currentTarget.classList.toggle("noHint");
		},
		handleRange : function(e, label){
			var elTag = e.target.tagName;
			var elClass = String(e.target.classList);
			var newInt = this.$data[label]
			if(!elTag == "I"){
				return;
			}
			var changes = {
				"double-left" : -10, "angle-left" : -1, "angle-right" : 1, "double-right" : 10
			}
			var range = this.minMax[label];
			for(var c in changes){
				if(elClass.indexOf(c) > -1){
					newInt += changes[c];
				}
			}
			newInt = (newInt < range[0])? range[0] : newInt ;
			newInt = (newInt > range[1])? range[1] : newInt ;
			this.$data[label] = newInt;
			var kids = e.currentTarget.children;
			for(var i=0; i<kids.length; i++){
				for(var c in changes){
					if(String(kids[i].classList).indexOf(c) > -1){
						if(newInt + changes[c] > range[1] || newInt + changes[c] < range[0]){
							kids[i].classList.add("outOfRange");
						}else{
							kids[i].classList.remove("outOfRange");
						}
					}
				}
			}
		},
		handleIsPredator : function(e){
			var dad = e.currentTarget, el = e.target, kids = dad.children;
			if(el.tagName != "I"){
				return;
			}
			for(var k=0; k<kids.length; k++){
				kids[k].classList.toggle("clicked");
			}
			this.$data.isPredator = !this.$data.isPredator;
		},
		toggleSpecieName : function(e){
			var el = e.currentTarget, text = el.innerText, found = false, newPrey = [];
			var prey = (this.$data.prey).slice();
			for(var i in prey){
				if(prey[i] == text){
					found = true;
					continue;
				}
				newPrey.push(prey[i]);
			}
			if(found){
				el.classList.remove("clicked");
				this.$data.prey = newPrey;
			}else{
				el.classList.add("clicked");
				this.$data.prey.push(text);
			}
		},
		toggleCustomPreference : function(e, attr){
			var dad = e.currentTarget, el = e.target, curr_cd_el = dad.children[1], curr_cd = curr_cd_el.innerText;
			if(el.tagName != "I"){
				return;
			}
			var cData = this.$props.all_custom_data[attr];
			var diff = (el.classList.contains("fa-angle-right"))? 1 : -1 ;
			for(var i in cData){
				var i = Number(i);
				if(cData[i] == curr_cd){
					var new_cd = cData[i + diff];
					new_cd = (!new_cd)? ((i == 0)? cData[cData.length -1] : cData[0] ) : new_cd ;
				}
			}
			curr_cd_el.classList.add("show");
			this.$set( this.$data.customPrefs, attr, new_cd );
		},
		/*For controlling custom data*/
		initCustomData : function(tempOnly){
			if(!tempOnly){
				var newCD = _.cloneObj(this.$data.settings.customData);
				for(var cd in newCD){
					this.$set(this.$data.customData, cd, newCD[cd]);
				}
			}
			var defaultTCDItem = {
				name : "", values : [], value : ""
			}
			for(var tcd in defaultTCDItem){
				this.$set(this.$data.tempCDItem, tcd, defaultTCDItem[tcd]);
			}
		},
		deleteCustomDataItem : function(attr){
			this.$delete(this.$data.customData, attr);
		},
		addCustomDataItem : function(){
			var tcd = this.$data.tempCDItem;
			if(!tcd.name.trim()){
				this.$emit("show_popup", "Please provide a name for the attribute, before saving.");
				return;
			}
			if(!tcd.values.length){
				this.$emit("show_popup", "Please provide at least one attribute value, before saving.");
				return;
			}
			this.$set(this.$data.customData, _.capitalize(tcd.name), tcd.values);
			this.initCustomData(true);
		},
		addTempCDItem : function(){
			var tcd = this.$data.tempCDItem;
			if(!tcd.value.trim()){
				this.$emit("show_popup", "Please provide a value for the attribute.");
				return;
			}
			this.tempCDItem.values.push(_.capitalize(tcd.value));
			tcd.value = "";
		},
		/* to hide specie settings tab */
		hideSpecieSettings : function(deleteTemp){
			if(this.$data.settings.isTemp && !deleteTemp){
				this.$emit("delete_specie_settings", this.$data.settings);
			}
			var maximizeNewSpecieTab = anim.maximizeNewSpecieTab;
			maximizeNewSpecieTab.reverse()
			maximizeNewSpecieTab.play()
		},
		deleteSpecieSettings : function(){
			this.$emit("delete_specie_settings", this.$data.settings);
			this.hideSpecieSettings(true);
		},
		/* to save data */
		saveSpecieSettings : function(){
			var sName = _.capitalize(this.$data.name.trim(), true);
			if(!sName){
				this.$emit("show_popup","Please provide a name for the species.");
				return;
			}
			var tempASN = this.$data.allSpecieNames, tempAS = this.$parent.$data.species;
			
			for(var s in tempAS){
				if(tempAS[s].id != this.$data.settings.id && tempAS[s].name.toLowerCase() == sName.toLowerCase()){
					this.$emit("show_popup", "'"+sName+"' Specie already exists.");
					return;
				}
			}
			var newS = {}, settingsData = this.$data.settings;
			for(var i in settingsData){
				newS[i] = this.$data[i];
			}
			newS.isTemp = false;
			this.$emit("save_specie_settings", newS);
			this.hideSpecieSettings(true);
		},
		/* to update data */
		init : function(newS){
			var data = newS;
			this.$data.settings = _.cloneObj(data);
			for(var i in data){
				if(i == "id"){
					this.$data.id = data.id;
					continue;
				}
				if(typeof data[i] == "number" && data[i] < this.$data.minMax[i][0]){
					this.$data[i] = this.$data.minMax[i][0];
				}else{
					this.$data[i] = data[i];
				}
			}
			this.$data.header = data.name;
			if(this.$data.prey === undefined){ this.$data.prey = []; }
			var cd = this.$props.all_custom_data;
			this.$data.customPrefs = {};

			for(var c in cd){
			//	console.log(data.name+" : "+data.customPrefs);
				if(_.contains(data.customPrefs, c)){
					this.$set(this.$data.customPrefs, c, data.customPrefs[c]);
				}else{
					this.$set(this.$data.customPrefs, c, cd[c][0]);
				}
			}
			this.initCustomData();
		}
	},
	computed : {
		saveButtonText : function(){
			var text = ((this.$data.settings.isTemp)? "Add" : "Save")+" Specie";
			return text;
		}
	},
	watch : {
		trigger : function(){
			var name = this.$parent.$data.displayedSpecie.name, allSpecies = this.$parent.$data.species;
			var allSpecieNames = [];
			for(var i in allSpecies){
				if(!allSpecies[i].isTemp){	allSpecieNames.push(i);		}
			}
			this.$data.allSpecieNames = allSpecieNames;
			this.init(this.$parent.$data.species[name]);
			document.querySelector(".newSpecie").scrollTop = 0;
		}
	},
	props :["all_custom_data","trigger"],

	template : '\
<div class="newSpecie_Box" @click.stop="hideSpecieSettings()">\
<div class="newSpecie noBar MS" @click.stop=""><header><span class="SS">{{header}}</span><span class="fa fa-arrow-left" @click.stop="hideSpecieSettings()"></span></header>'+'\
\
<div class="s_tabItem noHint" @click="toggleHint($event)">\
	<div class="inputBox">\
	    <span>Specie Name :</span><input type="text" pattern="[a-zA-Z]{3,15}" @click.stop="" v-model="name" required>\
    </div>\
	<div class="hintBox">The name for the species you are creating.</div>\
</div>'+'\
<div class="subtitle">\
	<h3>Inherited traits</h3>\
	<span>The following traits will be passed down as genes, from parents to offspring.<br>Mutations may occur.</span>\
</div>\
<div class="s_tabItem noHint" @click="toggleHint($event)">\
	<div class="inputBox rangeBox">\
		<span>Lifespan :</span>\
		<div class="range" @click.stop="handleRange($event, \'lifespan\')"><i class="fa fa-angle-double-left"></i><i class="fa fa-angle-left"></i><span>{{lifespan}}</span><i class="fa fa-angle-right"></i><i class="fa fa-angle-double-right"></i></div>\
	</div>\
	<div class="hintBox">The average lifespan for each member of the species.</div>\
</div>\
<div class="s_tabItem noHint" @click="toggleHint($event)">\
	<div class="inputBox rangeBox">\
		<span>Health :</span>\
		<div class="range" @click.stop="handleRange($event, \'health\')"><i class="fa fa-angle-double-left"></i><i class="fa fa-angle-left"></i><span>{{health}}</span><i class="fa fa-angle-right"></i><i class="fa fa-angle-double-right"></i></div>\
	</div>\
	<div class="hintBox">The health defines how long an individual can live, without food.</div>\
</div>\
<div class="s_tabItem noHint" @click="toggleHint($event)">\
	<div class="inputBox rangeBox">\
		<span>Maturity :</span>\
		<div class="range" @click.stop="handleRange($event, \'maturity\')"><i class="fa fa-angle-double-left"></i><i class="fa fa-angle-left"></i><span>{{maturity}}</span><i class="fa fa-angle-right"></i><i class="fa fa-angle-double-right"></i></div>\
	</div>\
	<div class="hintBox">This defines the <b>average</b> age at which each individual in the specie is ready to mate.</div>\
</div>\
<div class="s_tabItem noHint" @click="toggleHint($event)">\
	<div class="inputBox rangeBox">\
		<span>Children :</span>\
		<div class="range" @click.stop="handleRange($event, \'kids\')"><i class="fa fa-angle-double-left"></i><i class="fa fa-angle-left"></i><span>{{kids}}</span><i class="fa fa-angle-right"></i><i class="fa fa-angle-double-right"></i></div>\
	</div>\
	<div class="hintBox">This is the <b>average</b> amount of offspring conceived at once.</div>\
</div>\
<div class="s_tabItem noHint" @click="toggleHint($event)">\
	<div class="inputBox rangeBox">\
		<span>Offence :</span>\
		<div class="range" @click.stop="handleRange($event, \'offence\')"><i class="fa fa-angle-double-left"></i><i class="fa fa-angle-left"></i><span>{{offence}}</span><i class="fa fa-angle-right"></i><i class="fa fa-angle-double-right"></i></div>\
	</div>\
	<div class="hintBox">This defines the <b>average</b> ability of an individual in the specie to fight off predators.</div>\
</div>\
<div class="s_tabItem noHint" @click="toggleHint($event)">\
	<div class="inputBox rangeBox">\
		<span>Mating Drive :</span>\
		<div class="range" @click.stop="handleRange($event, \'sexDrive\')"><i class="fa fa-angle-double-left"></i><i class="fa fa-angle-left"></i><span>{{sexDrive}}</span><i class="fa fa-angle-right"></i><i class="fa fa-angle-double-right"></i></div>\
	</div>\
	<div class="hintBox">The mating instinct defines the strength of each individual\'s urge to mate.</div>\
</div>\
<div class="s_tabItem noHint" @click="toggleHint($event)">\
	<div class="inputBox rangeBox">\
		<span>Gestation :</span>\
		<div class="range" @click.stop="handleRange($event, \'pregnancy\')"><i class="fa fa-angle-double-left"></i><i class="fa fa-angle-left"></i><span>{{pregnancy}}</span><i class="fa fa-angle-right"></i><i class="fa fa-angle-double-right"></i></div>\
	</div>\
	<div class="hintBox">The gestation period defines how long it takes to conceive offspring after mating.<br/>Also known as the pregnancy duration.</div>\
</div>'+'\
<div class="s_tabItem noHint" @click="toggleHint($event)">\
	<div class="inputBox rangeBox">\
		<span>Is Predator :</span>\
		<div class="boolean" @click.stop="handleIsPredator($event)"><i :class="[isPredator? \'clicked\' : \'\' ]">Yes</i><i :class="[isPredator? \'\' : \'clicked\']">No</i></div>\
	</div>\
	<div class="hintBox">Defines whether the species is carnivorous or not.</div>\
</div>'+'\
\
<div class="subtitle" v-if="isPredator">\
	<h3>Predator traits</h3>\
	<span>The following traits are the predatory instincts of the specie.<br>No mutations will occur.</span>\
</div>'+'\
<div class="s_tabItem noHint" @click="toggleHint($event)" v-if="isPredator">\
	<div class="inputBox large">\
		<span>Prey :</span>\
		<div class="object prey noBar">\
			<span v-for="specieName in allSpecieNames" :class="[specieName, ((prey.indexOf(specieName) > -1)? \'clicked\' : \'\')]" @click.stop="toggleSpecieName($event)">{{specieName}}<i class="fa fa-check"></i></span>\
		</div>\
	</div>\
	<div class="hintBox">Specify all the prey this specie should hunt for.</div>\
</div>'+'\
<div class="s_tabItem noHint" @click="toggleHint($event)" v-if="isPredator && Object.keys(all_custom_data).length">\
	<div class="inputBox large">\
		<span>Preference :</span>\
		<div class="object preference" v-for="(cd_prefVals, cd_prefKey) in all_custom_data" v-bind:class="cd_prefKey" v-if="customPrefs[cd_prefKey]">\
			<span>{{cd_prefKey}}</span>\
			<div class="range" @click.stop="toggleCustomPreference($event, cd_prefKey)"><i class="fa fa-angle-left"></i><span><b>{{customPrefs[cd_prefKey]}}</b></span><i class="fa fa-angle-right"></i></div>\
		</div>\
	</div>\
	<div class="hintBox">Specify all the attributes this specie should prefer in its prey.<br>Example : <b>color : brown</b></div>\
</div>'+'\
'+'\
<div class="subtitle">\
	<h3>Personal traits</h3>\
	<span>The following traits are randomly inherited and passed down from parents to offspring.<br>No mutations will occur.</span>\
</div>\
<div class="s_tabItem">\
	<div class="inputBox large">\
		<span>Attributes :</span>\
		<div class="object attributes cData" v-for="(cdVals, cdKey) in customData">\
			<span>{{cdKey}}</span>\
			<span>{{cdVals.length}} value{{cdVals.length == 1? "" : "s"}}</span>\
			<span class="delete" v-on:click="deleteCustomDataItem(cdKey)">delete</span>\
		</div>\
		<div class="object newAttribute">\
			<nav class="name">\
				<div>Attribute name</div><input type="text" placeholder="Example : Color" v-model="tempCDItem.name">\
			</nav>\
			<nav class="vals">\
				<div>Attribute values</div>\
				<div class="attrValues">\
					<span v-for="val in tempCDItem.values">{{val}}</span>\
				</div>\
			</nav>\
			<div class="save">\
				<input type="text" placeholder="Example : Black" v-model="tempCDItem.value"><span v-on:click="addTempCDItem()">Add Value</span>\
			</div>\
		</div>\
		<div class="more" v-on:click="addCustomDataItem()"><span>Save Attribute</span></div>\
	</div>\
</div>'+'\
\
<div class="subtitle">\
	<h3>Initial Amount</h3>\
</div>\
<div class="s_tabItem noHint" @click="toggleHint($event)">\
	<div class="inputBox rangeBox">\
		<span>Initial :</span>\
		<div class="range" @click.stop="handleRange($event, \'initial\')"><i class="fa fa-angle-double-left"></i><i class="fa fa-angle-left"></i><span>{{initial}}</span><i class="fa fa-angle-right"></i><i class="fa fa-angle-double-right"></i></div>\
	</div>\
	<div class="hintBox">The original number of individuals in the species, before reproduction begins</div>\
</div>'+'\
\
<div class="submitBox TNR">\
	<button v-if="!settings.isTemp" @click.stop="deleteSpecieSettings()">Delete Specie</button>\
	<button @click.stop="saveSpecieSettings()"class="saveSpecie">{{saveButtonText}}</button>\
</div>'+'\
\
</div>\
</div>'
}//<i class="fa fa-check"></i>

return specieTab;
})