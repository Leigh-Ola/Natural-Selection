define(function(require){
	
	function randInt(mn, mx){
		var min = (mx === undefined)? 0 : mn ;
		var max = (mx === undefined)? mn : mx ;
		var ans = Math.floor(Math.random() *max +min);
		return ans;
	}
	
	function cloneObj(obj){
		var ans = {};
		for(var i in obj){
			var val = obj[i];
			var valType = getTypeof(val);
			if(valType == "object"){
				val = cloneObj(val);
			}else if(valType == "array"){
				val = cloneArr(val);
			}
			ans[i] = val;
		}
		return ans;
	}
	
	function cloneArr(arr){
		var ans = [];
		for(var i in arr){
			var val = arr[i];
			var valType = getTypeof(val);
			if(valType == "object"){
				val = cloneObj(val);
			}else if(valType == "array"){
				val = cloneArr(val);
			}
			ans.push(val);
		}
		return ans;
	}
	
	function getTypeof(x, y){
		function xType(x){
			var ans = (typeof x);
			if(ans == "object"){
				ans = (String(x.constructor).indexOf("Array") > -1)? "array" : ans ;
			}
			return ans;
		}
		var xType = xType(x);
		var ans = (arguments.length == 1)? xType : (y == xType);
		return ans;
	}
	
	function getSpecieTemplate(){
		return {
			name:"", lifespan:1, health:1, maturity: 1, kids:1, offence: 1, sexDrive: 10, pregnancy: 1, initial : 7, isPredator : false,
			prey : [],
			customPrefs : {},
			customData : {}
		}
	}
	
	function capitalize(text, onlyFirst){
		if(typeof text == "object"){
			return text;
		}
		var text = String(text);
		return (text.charAt(0).toUpperCase()+ ((onlyFirst)? text.substr(1) : text.substr(1).toLowerCase()) ).trim();
	}
	
	function contains(item, val){
		var count = 0;
		var fetchItem = (getTypeof(item, "array"))? function(x){ return item[x]; } : function(x){ return x; };
		for(var i in item){
			if(fetchItem(i) == val){
				count++;
			}
		}
		return count;
	}
	
	function decimalLen(val, len){
		var val = (String(val).indexOf(".") > -1)? val : Number("0."+String(val)) ;
		var approx = String(Number(val).toPrecision(2+len));
		var index = approx.indexOf(".");
		val = Number(approx.substr(((index < 0)? 0 : index)+1, len));
		return (approx == 1)? 9999 : val;
	}
	
	function decimalNumLen(val, len){
		var val = String(val);
		var dot = val.indexOf(".");
		if(dot > -1){
			val = val.substr(0, dot+2);
		}
		return val;
	}
	
	function getRange(num, diff){
		return [num-diff, num+diff];
	}
	
	function keys(el){
		var ans = [];
		for(var i in el){ ans.push(i); }
		return ans;
	}
	
	function replaceAll(text, item, val){
		var text = String(text);
		var regex= new RegExp(item,"ig");
		text = text.replace(regex, val);
		return text;
	}
	
	var scrollHandler = (function(){
		var startX = undefined, timer;
		var vueData;
		
		function handle(){
			if(startX === undefined){
				return; 
			}
			var endX = document.querySelector(".contentBox").scrollLeft;
			if(endX > startX+10){
				vueData.tabLevel = 2;
			}else if(startX > endX+10){
				vueData.tabLevel = 1;
			}
			startX = undefined;
		}
		var handler = function(){
			if(!vueData.tabScrollable){
				return;
			}
			if(timer){
				clearTimeout(timer);
			}
			if(startX === undefined){
				startX = document.querySelector(".contentBox").scrollLeft;
			}
			timer =setTimeout(function(){
				handle();
			},100);
		}
		var stopHandler = function(e){
		//	e.stopPropagation();
			e.preventDefault();
		}
		
		return {
			start : function(vueD){
				vueData = vueD;
				document.querySelector(".contentBox").addEventListener("touchmove", handler);
				document.querySelector(".contentBox").removeEventListener("touchmove", stopHandler);
			},
			stop : function(){
				document.querySelector(".contentBox").addEventListener("touchmove", stopHandler);
				document.querySelector(".contentBox").removeEventListener("touchmove", handler);
			}
		}
	})()
	
	var loader = {
		data : function(){ return {
	
		} },
		template : '\
	<div class="loaderContainer">\
		<span class="one" >\
			<span class="two" >\
				<span class="three" >\
					<span class="four">\
					</span>\
				</span>\
			</span>\
		</span>\
	</div>'
	}

	
	
	return {
		randInt : randInt,
		cloneObj : cloneObj,
		cloneArr : cloneArr,
		getTypeof : getTypeof,
		getSpecieTemplate : getSpecieTemplate,
		capitalize : capitalize,
		contains : contains,
		decimalLen : decimalLen,
		decimalNumLen : decimalNumLen,
		getRange : getRange,
		keys : keys,
		replaceAll : replaceAll,
		scrollHandler : scrollHandler,
		loader : loader
	}
});