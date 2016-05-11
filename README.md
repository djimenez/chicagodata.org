# ChicagoData.org
All website files for chicagodata.org, an open source data visualization application built and maintained by the Chicago Community Data Project. The Chicago Community Data Project is a nonprofit organization focused on helping citizens better understand their communities through the exploration and analysis of data.

# Components 
The site is made up of the following primary components: 
- d3.js for the SVG charts  
- crossfilter.js for slicing and dicing data
- dc.js for elegantly synthesizing crossfilter.js and d3.js functionality 
- leaflet.js for the maps 
- mapbox.js to style the maps 

# Data
This implementation relies almost exclusively on data pulled in from data.cityofchicago.org through their API. Data are in CSV and JSON formats, and some of the data are available for use without the API connection. Currently, the yearly crime data are in a local CSV file. 




