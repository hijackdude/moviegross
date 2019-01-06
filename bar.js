var app = {
	init: function(){
		this.cacheDOM();
		this.handleCharts();
	},
	cacheDOM: function(){
		this.$chart = $(".bar-chart");
	},
	cssSelectors: {
		chartBar: "bar-chart--inner"
	},
	handleCharts: function(){
	
	$.each(this.$chart, function(){
	var $this = $(this),
	total = $this.data("total"),
	$targetBar = $this.find("."+app.cssSelectors.chartBar);
	$targetBar.css("width","0%"); // zero out for animation
	setTimeout(function(){
	$targetBar.css("width",total+"%");
	},400);
		});
	}
}

app.init();