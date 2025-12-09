# Web GIS Final Project – "Wyoming Intersection Crashes per Road Condition and Type"

- University of Wyoming
- Course: GIST 5300, Web Mapping and Internet GIS
- Professor/Instructor: Dr. Shanshan Li
- Project's Author: Raul Freyre

## Overview
Interactive web map visualizing intersection-related crashes across the state of Wyoming.  
This project uses Leaflet.js, MarkerCluster, and OpenStreetMap basemaps to explore crash distribution,
weather-related conditions, and road characteristics in an intuitive and analytical web interface.

Inside this interactive map you can find crash records from intersections across Wyoming.  
Each crash is represented by a point on the map, colored according to the road condition at the
time of the crash (Dry, Winter, Rain, or Other). Points automatically cluster when zoomed out,
showing how many crashes occur in an area. When zooming in, individual crashes become visible.

Clicking on a crash point opens a custom popup showing:

- Crash case number  
- Year  
- Road condition  
- Intersection name  
- Road type (Urban / Rural)  
- City and county  
- Latitude & longitude  
- **A breakdown of all crashes at the same location**, including:
  - Total crashes at that point  
  - Winter crashes  
  - Rain crashes  
  - Dry crashes  
  - Other crashes  

This makes it easy to identify high-risk intersections and evaluate how weather contributes to crash frequency.

---

## 1. Data Preparation and Cleaning
The crash dataset used in this project is courtesy of the Wyoming Department of Transportation (WYDOT).

The original dataset contained many attributes that were not necessary for the purposes of this project.
The data was cleaned and simplified manually to include only fields relevant to spatial mapping and analysis:

- `LAT` – Latitude  
- `LON` – Longitude  
- `crash_case` – Crash identification number  
- `year` – Year of the crash  
- `county` – County where the crash occurred  
- `city` – City where the crash occurred  
- `intersection` – Approximate intersection location  
- `road_type` – Urban or rural roadway  
- `road_condition` – Condition of the roadway at the time of the crash  

Additional processing was performed to:

- Normalize weather-related categories into four classes (Dry, Winter, Rain, Other)  
- Count total crashes per intersection coordinate  
- Produce detailed breakdowns of crash types per location  
- Associate each crash point with filterable categories  


---

## 2. Web Map Development

The web map was built using Leaflet.js, an open-source JavaScript library for interactive maps.  
This map contains many features as:

Weather Category Filtering  
Control panel allows toggling of:
- Dry  
- Winter (ice, frost, slush, snow)  
- Rain / Wet  
- Other (mud, gravel, unknown, etc.)  

Road Type Filtering  
Filter crashes based on:
- Urban  
- Rural  

Marker Clustering  
Crashes aggregate into clusters when zoomed out.  
Each cluster displays the number of crashes in that area.  
Clicking on a cluster zooms into that region automatically.

Crash Breakdown per Location  
Popups include a full breakdown of all crashes that occurred at the same coordinates.

Custom Popup Data  
Each popup includes detailed information about the individual crash, plus context about the intersection as a whole.

Zoom on Data  
Clicking an individual crash marker automatically zooms into its location.

---
## 3. Techical Approach

This map requires creating a marker for every crash in the dataset.
Because there may be hundreds or thousands of records, manually adding markers would be impossible.
The solution is a forEach() loop that reads each crash row and builds a map marker dynamically.
For every crash record:

1. Read coordinates
2. Assign weather category
3. Determine the correct color
4. Create a Leaflet marker
5. Build the custom popup
6. Attach zoom behavior
7. Store the marker for clustering and filtering

This is the core mechanic that builds the entire map.

**Before creating markers, another forEach() loop goes** through the dataset to count how many crashes occurred at each coordinate, producing a detailed breakdown.
This powers the popup section:

- Total crashes at this location 
- Winter crashes
- Rain crashes  
- Dry crashes  
- Other crashes 

---

## 4. Motivation and Achievements

The primary motivation behind this project was to explore how weather conditions and roadway characteristics influence crash occurrences at intersections across Wyoming. By transforming a raw WYDOT crash dataset into an interactive spatial tool, the goal was to gain deeper insight into high-risk locations and evaluate patterns that are not immediately obvious in tabular form.

Throughout the development of this map, several key achievements were accomplished.
The dataset was cleaned and normalized to retain only the most relevant fields, and roadway conditions were systematically categorized into four clear weather groups. An advanced visualization system was implemented using Leaflet.js, including clustering, category-based filtering, and dynamic popups. A major analytical enhancement was the integration of crash breakdowns per location, allowing users to instantly see how many crashes by year and weather condition occur at any specific intersection.

---

## 5. Files Included
| File | Description |
|------|--------------|
| `crashes_cleaned.csv` | Cleaned dataset of crashes and its conditions across Wyoming intersections |
| `index.html` | Main web page with the interactive Leaflet map |
| `script.js` | Main file with the content of the javascript code with the "bones" of the map |
| `style.css` | Code for the fortmat and style of the map |
| `readme.md` | The file with the content of the descriptions for this project |

---

## 6. Deployment
The project can be hosted directly on GitHub Pages.  
Once uploaded, the map can be viewed online by navigating to:  
```
https://rfreyrep.github.io/MapGIS_FinalProject_Raul_Freyre/
```

