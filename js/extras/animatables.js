define(function(){	
	var maximizeNewSpecieTab= new anime({
		targets : document.querySelector(".newSpecie_Box"),
		translateX :{
			value : "+=105%", duration :50
		},
		easing:"easeOutSine", delay : 0,
		scale : [
			{value: 0.05, duration: 0, delay : 0},
			{value: 0.1, duration: 100, delay : 0},
			{value: 1, duration: 300, delay : 0}
		],
		opacity : [
			{value: 0, duration: 0},
			{value: 0, duration: 100},
			{value: 1, duration: 300}
		],
		loop : false, autoplay : false
	});
	
	var thinkingAI = anime.timeline({
		loop : 5, autoplay : false, direction : "normal", delay : 0
	});
	thinkingAI.add({
		targets : ".predictionTab .thinking i:nth-child(1)",
		easing : "linear", delay : 0,
		scale : [
			{value : 1.2, duration : 150},
			{value : 1.5, duration : 150},
			{value : 1.2, duration : 150},
			{value : 1, duration : 150},
		],
		translateY : [
			{value : "+=10px", duration : 150},
			{value : "-=10px", duration : 150},
			{value : "-=10px", duration : 150},
			{value : "+=10px", duration : 150}
		]
	});
	thinkingAI.add({
		targets : ".predictionTab .thinking i:nth-child(2)",
		easing : "linear", delay : 0,
		scale : [
			{value : 1.2, duration : 150},
			{value : 1.5, duration : 150},
			{value : 1.2, duration : 150},
			{value : 1, duration : 150},
		],
		translateY : [
			{value : "+=10px", duration : 150},
			{value : "-=10px", duration : 150},
			{value : "-=10px", duration : 150},
			{value : "+=10px", duration : 150}
		], offset : "-=200"
	});
	thinkingAI.add({
		targets : ".predictionTab .thinking i:nth-child(3)",
		duration : 600, easing : "linear",
		scale : [
			{value : 1.2, duration : 150},
			{value : 1.5, duration : 150},
			{value : 1.2, duration : 150},
			{value : 1, duration : 150}
		],
		translateY : [
			{value : "+=10px", duration : 150},
			{value : "-=10px", duration : 150},
			{value : "-=10px", duration : 150},
			{value : "+=10px", duration : 150}
		], offset : "-=200"
	});

	return {
		maximizeNewSpecieTab : maximizeNewSpecieTab,
		thinkingAI : thinkingAI
	}
});