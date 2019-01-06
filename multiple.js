var fullwidth = 250;
fullheight = 180;

var margin = {top: 20, right: 63, bottom: 20, left: 23},
 width = fullwidth - margin.left - margin.right,
 height = fullheight - margin.top - margin.bottom;

var parseDate = d3.timeParse("Year %Y");
var formatDate = d3.timeFormat("%Y");

var xScale = d3.scaleTime()
 .range([0, width])

var yScale = d3.scaleLinear()
 .range([height, 0])

var yAxis = d3.axisLeft(yScale)
 .ticks(4)
 .tickFormat(d3.format(".0s"));

var xValue = function(d) {
 return d.date;
};
var yValue = function(d) {
 return d.count;
};

var area = d3.area()
 .x(function(d) { return xScale(xValue(d)); })
 .y0(height)
 .y1(function(d) { return yScale(yValue(d)); });

var line = d3.line()
 .x(function(d) { return xScale(xValue(d)); })
 .y(function(d) { return yScale(yValue(d)); });

var ness = "emissions";

var data = [],
 circle = null,
 caption = null,
 curYear = null; 

var bisect = d3.bisector(function(d) {
 return d.date;
}).left;

function setupScales(data){
 var extentX, maxY;

 extentX = d3.extent(data[0].values, function(d){
     return xValue(d);
 })
 xScale.domain(extentX);

 maxY = d3.max(data, function(d){ 
     return d3.max(d.values, function(v){
         return yValue(v);
     })
 });
 yScale.domain([0, maxY*1.15]);
}

function transformData(rawData) {
 rawData.forEach(function(r){
     r.date = parseDate(r.Year);
     r.count = + r[ness];
 });

 var nest = d3.nest()
     .key(function(r){ return r.Country; })
     .sortValues(function(a,b){ return a.date - b.date; })
     .entries(rawData);

 nest = nest.filter(function(n){
     return n.values.length == 31;
 })   

 return nest; 
}

function setupIsotope() {
 $("#vis").isotope({
     itemSelector: '.chart',
     layoutMode: 'fitRows',
     getSortData: {
         count: function(e) {
             var d, sum;
             d = d3.select(e).datum();
             sum = d3.sum(d.values, function(d) {
                 return d.count;
             });
             return sum * -1;
         },
         country: function(e) {
             var d;
             d = d3.select(e).datum();
             return d.key;
         }
     }
 });
 return $("#vis").isotope({
     sortBy: 'count'
 });
}

d3.csv("gross.csv", function(error, data) { 

 if (error) { console.log(error); };

 var countries = transformData(data);

 d3.select("#vis").datum(countries).each(function(myData){

     setupScales(myData);

     var div = d3.select(this).selectAll(".chart").data(myData);

     var svg = div.enter()
         .append("div")
         .attr("class","chart")
         .append("svg")
         .attr("width", fullwidth)
         .attr("height", fullheight)
         .append("g")
         .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

     svg.append("rect")
         .attr("class", "background")
         .attr("width", width + margin.right) 
         .attr("height", height)
         .style("pointer-events", "all")
         .on("mouseover", mouseover)
         .on("mousemove", mousemove)
         .on("mouseout", mouseout);


   var lines = svg.append("g").attr("class", "lines");

     lines.append("path")
         .attr("class", "area")
         .style("pointer-events", "none")
         .attr("d", function(c) {
             return area(c.values);
         });

     lines.append("path")
         .attr("class", "line")
         .style("pointer-events", "none")
         .attr("d", function(c) {
             return line(c.values);
         });

     lines.append("text")
         .attr("class", "static_year")
         .attr("x", 0)
         .attr("y", height + margin.bottom/2)
         .style("text-anchor", "start")
         .text(function(c) {
             return formatDate(c.values[0].date);
         });

     lines.append("text")
         .attr("class", "title")
         .attr("x", width/2)
         .attr("y", -8)
         .style("text-anchor", "middle")
         .text(function(d) {
             return d.key;
         });

     lines.append("text")
         .attr("class", "static_year")
         .attr("x", width)
         .attr("y", height + margin.bottom/2)
         .style("text-anchor", "end")
         .text(function(d) {
             return formatDate(d.values[d.values.length - 1].date);
         });

     var circle = lines.append("circle")
         .attr("class", "circle")
         .attr("opacity", 0)
         .attr("r", 3)
         .attr("fill","green")
         .style("pointer-events", "none");

     var caption = lines.append("text")
         .attr("class", "caption")
         .attr("text-anchor", "middle")
         .style("pointer-events", "none")
         .attr("dy", -8);

      var curYear = lines.append("text")
         .attr("class", "curYear")
         .attr("text-anchor", "middle")
         .style("pointer-events", "none")
         .attr("dy", 13)
         .attr("y", height);

     lines.append("g").attr("class","y axis").call(yAxis);

     function mouseover(){
         circle.attr("opacity", 1);
         d3.selectAll(".static_year").classed("hidden", true);
     }

     function mousemove(){
         var year = xScale.invert(d3.mouse(this)[0]).getFullYear();
         var date = d3.timeParse("%Y")(year);

         var index = 0;
         circle
             .attr("cx", xScale(date)) 
             .attr("cy", function(c) {
                 index = bisect(c.values, date, 0, c.values.length - 1); 
                 return yScale(yValue(c.values[index])); 
             })


         caption.attr("x", xScale(date))
             .attr("y", function(c) {
                 return yScale(yValue(c.values[index]));
             })
             .text(function(c) {
                 return yValue(c.values[index]) ;
             });
         return curYear.attr("x", xScale(date)).text(year);
     }

     function mouseout(){
         d3.selectAll(".static_year").classed("hidden", false);
         circle.attr("opacity", 0);
         caption.text("");
         return curYear.text("");
     }

 })// each

 setupIsotope();

  d3.select("#form").selectAll("label").on("click", function() {
     var id;
     id = d3.select(this).attr("id");
     d3.select("#form").selectAll("label").classed("active", false);
     d3.select("#" + id).classed("active", true);
     return $("#vis").isotope({
       sortBy: id
     });
 }); // end button setup
})
