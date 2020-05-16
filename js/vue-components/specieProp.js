define(function(){
var specieProp = {
	data : function(){ return {
		className : "specie"
	}},
	methods : {
		showSpecieSettings : function(name){
			this.$emit("show_specie_settings", name)
		}
	},
	props : ["specie"],
	template : '<aside class="specie" :class="[specie.type, (specie.isTemp)? \'hide\' : \'\']" @click="showSpecieSettings(specie.name)"><span>{{specie.name}}</span><i></i></aside>'
}

return specieProp;
});