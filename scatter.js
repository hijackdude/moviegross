var fw = 820;
var fh = 520;

var mar = { top: 10, right: 30, bottom: 70, left: 80 };

var w = fw - mar.left - mar.right;
var h = fh - mar.top - mar.bottom;

var svg = d3.select("#sca")
		.append("svg")
		.attr("width", fw)
		.attr("height", fh)
		.append("g")
		.attr("transform", "translate(" + mar.left + "," + mar.right + ")");

var g = svg.append("g")
			.attr("transform", "translate(" + mar.left + "," + mar.top + ")");

var dotRadius = 2; 
var dotColor = "grey";

var x = d3.scaleLinear()
			   .range([ 0, w])					

var y = d3.scaleLinear()
			   .range([ h, 0 ])
					
var xA = d3.axisBottom(x)
				.ticks(5); 

var yA = d3.axisLeft(y);

var tooltip = d3.select("body")
				.append("div")
				.attr("class","tooltip");

d3.csv("movies.csv", function(data) {
	
	d3.select("#all")
	.on("click", function(d,i) {
		d3.select(this).classed("selected", true);
		d3.select("#vote").classed("selected", false);
		d3.select("#popularity").classed("selected", false);
		var newData = data;
		update(newData);
	});

d3.select("#vote")
	.on("click", function(d,i) {
		d3.select(this).classed("selected", true);
		d3.select("#all").classed("selected", false);
		d3.select("#popularity").classed("selected", false);
		var newData = data.sort(function(a,b) {
				  return b.vote - a.vote;
			  }).slice(0, 10);
		update(newData);
	});

d3.select("#popularity")
	.on("click", function(d,i) {
		d3.select(this).classed("selected", true);
		d3.select("#all").classed("selected", false);
		d3.select("#vote").classed("selected", false);
		var newData = data.sort(function(a,b) {
				  return b.popularity - a.popularity;
			  }).slice(0, 10);
		update(newData);
	});

d3.select("#all").classed("selected", true);
	  update(data);  

	  svg.append("g")
		.attr("class", "x")
		.attr("transform", "translate(0," + h + ")")
		.call(xA);

	svg.append("g")
		.attr("class", "y")
		.call(yA);

	svg.append("text")
		.attr("class", "xlabel")
		.attr("transform", "translate(" + (w / 2) + " ," +
					(h + 25) + ")")
		.style("text-anchor", "middle")
		.attr("dy", 12)
		.text("Vote Value");

	svg.append("text")
		.attr("class", "ylabel")
		.attr("transform", "rotate(-90) translate(" + (-h/2)
					 + ",-50)")
		.style("text-anchor", "middle")
		.attr("dy", -30)
		.text("Gross Value");

	

	function update(data) {

		  x.domain(d3.extent(data,function(d){ return +d.vote; })).nice();
		y.domain(d3.extent(data,function(d){ return +d.popularity; })).nice();

		var circles = svg.selectAll("circle")
			.data(data, function(d) {return d.titles;})
			.attr("class","circle"); // key function!

		circles.enter()
			.append("circle")
			.merge(circles)
			.transition()
			.duration(2000)
			.attr("cx", function(d) {
				return x(+d.vote);
			})
			.attr("cy", function(d) {
				return y(+d.popularity);
			})
			.attr("r", function(d) {
				if (d.titles == "" || d.titles == "") {
					return 4;
				}
				else {
					return dotRadius;
				}
			})
			.attr("fill",function(d) {
				if (d.titles == "" || d.titles == "") {
					return "#32CD32";
				}
				else {
					return dotColor;
				}
			});
			

		circles
			.exit()
			.transition()
			.duration(1000)
			.style("opacity", 0)
			.remove();

		var dottooltip = svg.selectAll("circle")
			.attr("class","circle")
			.on("mouseover",mouseoverFunc)
			.on("mousemove",mousemoveFunc)
			.on("mouseout",mouseoutFunc);


		svg.select(".x")
			.transition()
			.duration(1000)
			.call(xA);

		svg.select(".y")
			.transition()
			.duration(1000)
			.call(yA);

		

	} 

});
		function mouseoverFunc(d){
		tooltip
			.style("display",null)
			.html("<p>" + d.titles + "<br>Vote Value: " + d.vote  + "<br>Gross Value: " + d.popularity);
			d3.select(this)
				.transition()
				.duration(50)
				.attr("r", "5");
		}

		function mousemoveFunc(d){
				tooltip
					.style("top",(d3.event.pageY - 10) + "px")
					.style("left",(d3.event.pageX + 10) + "px");
		}

		function mouseoutFunc(d){
				tooltip
					 .style("display","none");
					 d3.select(this)
						 .transition()
						 .attr("r", function(d) {
							if (d.titles == "" || d.titles == "" || d.titles == ""|| d.titles == ""|| d.titles == "") {
								return 4;
							}
							else {
								return dotRadius;
							}
			})
		}
