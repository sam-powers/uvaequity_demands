var DemandTextNested;

function DrawDemandDocs(demand_text, events, images) {


    DemandTextNested = d3.nest()
        .key((d) => d.YEAR)
        .key((d) => d.DocTitle)
        .key((d) => d.PageNum)
        .entries(demand_text); // Nest to the top level of organization – the Year

    var YearList = d3.map(DemandTextNested, (d) => d.key).keys()
    //            console.log(YearList);

    var demandstimeline = d3.selectAll("#timelinecontainer").classed("d-flex", true)
        .classed("flex-row", true); // Select the container for the demands timeline

    var demanyearboxes = demandstimeline
        .selectAll(".years") // Create one box for each year
        .data(DemandTextNested)
        .enter()
        .append("div")
        .attr("class", d => d.values[[0]].values[[0]].values[[0]].docid)
        .classed("years", true)
        .classed("d-flex", true)
        .classed("flex-row", true)
        .attr("id", (d) => "Y" + d.key);

    var yeartextcolumn = demanyearboxes // Divide Each Year into a Text Column and a Div area for the Demands
        .append("div")
        .classed("yeartextcolumn", true).classed("d-flex", true);

    var yeartextbox = yeartextcolumn.append("div").classed("yeartextbox", true).attr("id", d => "YT" + d.key); // Create a box for the year inside the text column

    var yeartitles = yeartextbox.append("h3").text(d => d.key).classed("yearlabels", true); // Generate the Year title

    var demandboxcontainer = demanyearboxes // Create the Box that will hold all the demand texts for that year
        .append("div")
        .classed("demandboxcontainer", true);

    var demandboxes = demandboxcontainer
        .selectAll(".demandboxes")
        .data((d) => d.values)
        .enter()
        .append("div")
        .classed("demandbox", true)
        .classed("secondbox", function (d) {
            if (d.values[[0]].values[[0]].YearOrder > 1) {
                return true;
            } else {
                return false;
            }
        })
        .attr("id", (d) => "did" + d.values[[0]].values[[0]].docid);

    var documentlinks = demandboxes
        .append("a")
        .attr("tabindex", 0)
        .attr("aria-label", (d) => "open full " + d.values[[0]].values[[0]].filename_updated )

        .attr("xlink:href", function (d) {
            "../assets/documents/" + d.values[[0]].values[[0]].filename_updated;
        })
        .append("i")
        .classed("fas", true)
        .classed("fa-external-link-alt", true)
        .classed("pointer", true)

        .on("click", function (d) {
            window.open("../assets/documents/" + d.values[[0]].values[[0]].filename_updated);
        })
    //    .on("k", function (d) {
    //        window.open("../assets/documents/" + d.values[[0]].values[[0]].filename_updated);
    //    })


    ;
    var documenttitleboxes = demandboxes.append("div").classed("documenttitlebox", true);
    var documenttitles = documenttitleboxes.append("h3").text((d) => d.key);
    var documenttitlebreaks = documenttitleboxes.append("hr");


    var documenttitles = documenttitleboxes.append("h4").text((d) => "Written by " + d.values[[0]].values[[0]].Author);
    var documenttitles = documenttitleboxes.append("h4").text((d) => d.values[[0]].values[[0]].details);



    var demandpagescontainer = demandboxes.append("div").classed("demandpagescontainer", true).classed("d-flex", true);

    var demandlinescontainer = demandpagescontainer.selectAll(".demandlinescontainer")
        .data((d) => d.values)
        .enter().
    append("div")
        .classed("demandlinescontainer", true)
        .classed("d-flex", true)
        .classed("flex-column", true);

    var demandlines = demandlinescontainer
        .selectAll(".demandlines")
        .data((d) => d.values)
        .enter()
        .append("div")
        .classed("demandlines", true)
        .attr("id", (d) => "ID" + d.demand_id)
        .on("mouseover", mouseover)
        .on("mousemove", mousemove)
        .on("mouseleave", mouseleave);

    ColorDemands(DemandsTags, "Minority Faculty / Staff Recruitment and Retention");


    //Set the Top Timeline based on the Bottom Widths  
    var projectwidths = [];
    var yearstarts = []
    var yeartextboxwidth = document.getElementById("YT1970").offsetWidth;
    var yearnums = [];

    var i;

    for (i = 0; i < YearList.length; i++) {
        projectwidths[i] = document.getElementById("Y" + YearList[[i]]).offsetWidth
        yearstarts[i] = projectwidths.reduce(function (a, b) {
            return a + b;
        }, 0) - projectwidths[i] + yeartextboxwidth;
        yearnums[i] = Number(YearList[[i]])
    };

    var projectwidth = projectwidths.reduce(function (a, b) {
        return a + b;
    }, 0);

    var projectheight = document.getElementById("timelinebox").offsetHeight;

    var timelinebox = document.getElementById('timelinebox');
    timelinebox.setAttribute("style", "width:" + projectwidth + "px");

    var timeline = document.getElementById('timeline');
    timeline.setAttribute("style", "width:" + projectwidth + "px");

    var yearfinal = d3.max(YearList) - 1 * -1;

    yearnums[YearList.length] = yearfinal;
    yearstarts[YearList.length] = projectwidth;

    timelinex = d3.scaleLinear()
        .domain(yearnums)
        .range(yearstarts);

    var eventscontainer = d3.select("#eventscontainer");

    // Timeline Points
    eventscontainer.selectAll(".timepoints").data(events).enter().append("div")
        .classed("timepoints", true)
        .classed("rounded-circle", true)
        .style("left", d => timelinex(d.YearPercent) + "px")
        .style("bottom", "0px")
        .style("transform", "translate(-50%, 50%)");

    // Timeline Text
    eventscontainer.selectAll(".eventtext").data(events).enter().append("div")
        .classed("eventtext", true)
        .style("left", d => timelinex(d.YearPercent) + "px")
        //    .style("bottom", "2px")
        .style("bottom", d => (d.vert * 50 + 10) + "px")
        .text(d => d.Year + " " + d.Text)
        .on("mouseover", mouseovertip)
        .on("mouseleave", mouseleavetip);

    // Timeline Lines
    eventscontainer.selectAll(".timepointer").data(events).enter().append("div")
        .classed("timepointer", true)
        //      .classed("rounded-circle", true)
        .style("left", d => timelinex(d.YearPercent) + "px")
        .style("bottom", "2px")
        .style("height", d => (d.vert * 50 + 10) + "px")
        .style("transform", "translate(-50%, 0)");

    images_nested = d3.nest()
        .key((d) => d.Year)
        .entries(images);


    var imageyearcontainers = eventscontainer.selectAll(".imageyearcontainers").data(images_nested).enter()
        .append("div")
        .classed("imageyearbox", true)
        .style("left", d => timelinex(d.values[[0]].YearPercent) + "px")
        .style("top", "5%")


    var imagecontainers = imageyearcontainers
        .selectAll(".eventimageboxes")
        .data(d => d.values)
        .enter()
        .append("div")
        .classed("eventimagebox", true)
        .on("mouseover", mouseoverimage)
        .on("mouseleave", mouseleaveimage)
        .on("click", function (d) {
            window.open(d.Link);
        })
        .append("a")
        .attr("xlink:href", d => d.Link);;

    // Timeline Images
    //  var imagecontainers =  eventscontainer.selectAll(".eventimageboxes").data(images).enter()
    //   .append("div")
    //        .classed("eventimagebox", true)
    //        .style("left", d => timelinex(d.YearPercent) + "px")
    //        //    .style("bottom", "2px")
    //        .style("bottom", d => ((d.ManualAdjust)*50 + 150) + "px")
    //         .style("transform", "translate(-50%, 50%)")
    //        .on("mouseover", mouseoverimage)
    //        .on("mouseleave", mouseleaveimage)
    //        .on("click", function(d) { window.open(d.Link); })
    //      .append("a")
    //   .attr("xlink:href", d => d.Link);

    imagecontainers
        .append("img")
        .attr("src", function (d) {
            return "../assets/pics/timelinepics/" + d.ImageFile
        })
        .attr("class", "eventimage")
        .attr("alt", d=> d.Year + " From " + d.Source + " " + d.Brief_Description);
    //        .text(d => d.Year + " " + d.Text)
    //        .on("mouseover", mouseovertip)
    //        .on("mouseleave", mouseleavetip);

}
var timelinex;
var images_nested;
