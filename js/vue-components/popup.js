define(function(require){

var popup = {
	data : function(){ return {
		number : 0, range : [0,0]
	} },
	methods : {
		cancel : function(){
			var data = this.$props.data;
			data.show = false; 
			data.callback(false);
		},
		proceed : function(){
			var data = this.$props.data;
			var result = (this.$props.data.showRange)? this.$data.number : true ;
			data.show = false; 
			data.callback(result);
		},
		changeNumber : function(val){
			var range = this.$data.range;
			var val = (this.$data.number+val)
			if(val > range[1]){
				val = range[1];
			}else if(val < range[0]){
				val = range[0];
			}
			this.$data.number = val;
		}
	},
	watch : {
		"data.show" : function(){
			var range = this.$props.data.range;
			this.$data.range = range;
			this.$data.number = range[0];
			
			var text = this.$props.data.text;
			text = _.replaceAll(text, "</br>", "\n");
 			this.$props.data.text = text;
		}
	},
	props : ["data"],
	template : '<div class="popupTab noBar" v-on:click="cancel()" v-if="data.show">\
		<div class="popup" v-on:click.stop="">\
			<div class="text noBar" v-html="data.text"></div>\
			<div class="range" v-if="data.showRange">\
				<i class="fa fa-angle-double-left" @click="changeNumber(-10)" :class="{\'unClickable\' : (number-10 < range[0])}"></i><i class="fa fa-angle-left" @click="changeNumber(-1)" :class="{\'unClickable\' : (number-1 < range[0])}"></i><span>{{number}}</span><i class="fa fa-angle-right" @click="changeNumber(1)" :class="{\'unClickable\' : (number+1 > range[1])}"></i><i class="fa fa-angle-double-right" @click="changeNumber(10)" :class="{\'unClickable\' : (number+10 > range[1])}"></i>\
			</div>\
			<div class="buttonBox">\
				<button v-on:click.stop="proceed()" >{{data.option? data.option : "Got It" }}</button>\
			</div>\
		</div>\
	</div>'
}
	
return popup;
});