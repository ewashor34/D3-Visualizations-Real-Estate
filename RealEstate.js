// javascript 

// csv method to read in data from allProperties 
d3.csv("allProperties.csv").then(function(data) {
    console.log(data); // Check if data loads properly

    // loop through csv and assign price and sqft as variables 
    data.forEach(d => {
        d.price = +d.price;
        d.sqft = +d.sqft;
    });
    
    // Scatter Plot var. declarations 
    const width = 600, height = 400, margin = {top: 20, right: 30, bottom: 40, left: 60};
    
    // select(#scatter-cont) adds this to the scatter container in html div
    const svg = d3.select("#scatter-cont").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);
    
    // define x as sqft range 
    const x = d3.scaleLinear()
        .domain(d3.extent(data, d => d.sqft))
        .range([0, width]);
    
    // define y as price w respective domain 
    const y = d3.scaleLinear()
        .domain(d3.extent(data, d => d.price))
        .range([height, 0]);
    
    // this appends x-axis to scatter plt
    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x));
    
    // appends x axis to scatter plot 
    svg.append("g")
        .call(d3.axisLeft(y));
    
    // selectAll will draw the pts for scatterplt, and make x = sqft and y = price, w/ fill as blue 
    svg.selectAll("circle")
        .data(data)
        .enter().append("circle")
        .attr("cx", d => x(d.sqft))
        .attr("cy", d => y(d.price))
        .attr("r", 3)
        .style("fill", "steelblue");
    
    // // Box Setup 
    // note "SET" makes this unique as in Python
    const allCities = Array.from(new Set(data.map(d => d.city)));
    
    // Need to filter out a few cities, their boxplots don't have sufficient data 
    const city_remove = ['Glenview','Willowbrook', 'Burr Ridge'];
    const cities = allCities.filter(c => !city_remove.includes(c));

    // xbox is x axis for the boxplot (I'm choosing to use cities)
    const xBox = d3.scaleBand().domain(cities).range([0, width]).padding(0.2);

    // I want to redefine y axis to max out at 4_000_000 for less blank space 
    const y2 = d3.scaleLinear()
        .domain([0,4000000])
        .range([height, 0]);
    
    // put the boxplot in the right container in html file, append svg element
    const boxSvg = d3.select("#box-cont").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);
    
    // add x axis to box plt
    boxSvg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(xBox));
    
    // add y axis to box plt
    boxSvg.append("g")
        .call(d3.axisLeft(y));
    
    // summary stats for each city, for quartiles 
    const summaryStats = cities.map(city => {
        const prices = data.filter(d => d.city === city).map(d => d.price).sort(d3.ascending);

        // edge case if no prices 
        if (prices.length === 0) return null;

        // get all quartiles 
        const q1 = d3.quantile(prices, 0.25);
        const median = d3.quantile(prices, 0.5);
        const q3 = d3.quantile(prices, 0.75);
        const iqr = q3 - q1;
        const min = Math.max(d3.min(prices), q1 - 1.5 * iqr);
        const max = Math.min(d3.max(prices), q3 + 1.5 * iqr);

        return { city, min, q1, median, q3, max };
        
    // filter out rows that are null 
    }).filter(d => d !== null);


// Draw Boxplot Elements
summaryStats.forEach(stat => {
    
    // Box
    boxSvg.append("rect")
        .attr("x", xBox(stat.city))
        .attr("y", y2(stat.q3))
        .attr("width", xBox.bandwidth())
        .attr("height", y2(stat.q1) - y2(stat.q3))
        .attr("stroke", "black")
        .attr("fill", "lightblue");

    // Median (dark blue line for clarity )
    boxSvg.append("line")
        .attr("x1", xBox(stat.city))
        .attr("x2", xBox(stat.city) + xBox.bandwidth())
        .attr("y1", y2(stat.median))
        .attr("y2", y2(stat.median))
        .attr("stroke", "darkblue");

    // Lower whisker
    boxSvg.append("line") 
        .attr("x1", xBox(stat.city) + xBox.bandwidth() / 2)
        .attr("x2", xBox(stat.city) + xBox.bandwidth() / 2)
        .attr("y1", y2(stat.min))
        .attr("y2", y2(stat.q1))
        .attr("stroke", "black");

    // Upper whisker
    boxSvg.append("line") 
        .attr("x1", xBox(stat.city) + xBox.bandwidth() / 2)
        .attr("x2", xBox(stat.city) + xBox.bandwidth() / 2)
        .attr("y1", y2(stat.q3))
        .attr("y2", y2(stat.max))
        .attr("stroke", "black");
    })
});

