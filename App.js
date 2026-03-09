import { useEffect, useState } from "react";
import axios from "axios";
import ForceGraph2D from "react-force-graph-2d";

import {
BarChart,
Bar,
XAxis,
YAxis,
Tooltip,
ResponsiveContainer,
CartesianGrid,
Legend,
Cell
} from "recharts";

function App() {

const [edges,setEdges] = useState([]);
const [workers,setWorkers] = useState({});
const [hazards,setHazards] = useState({});
const [zones,setZones] = useState({});
const [route,setRoute] = useState([]);

const backend = "http://localhost:5000";

const loadMap = () => {

axios.get(backend + "/map")

.then(res=>{
setEdges(res.data.edges);
setWorkers(res.data.workers);
setHazards(res.data.hazards);
setZones(res.data.zones);
});

};

useEffect(()=>{
loadMap();
},[]);


const moveWorkers = () => {
axios.get(backend + "/move_workers")
.then(res=>setWorkers(res.data));
};

const triggerHazard = () => {
axios.get(backend + "/trigger_hazard")
.then(res=>setHazards(res.data));
};

const spreadHazard = () => {
axios.get(backend + "/spread_hazard")
.then(res=>setHazards(res.data));
};

const evacuate = () => {
axios.get(backend + "/evacuate/Worker1")
.then(res=>setRoute(res.data.route));
};


/* ---------- GRAPH DATA ---------- */

const nodes=[];

edges.forEach(e=>{
nodes.push({id:e[0]});
nodes.push({id:e[1]});
});

const uniqueNodes = Array.from(new Set(nodes.map(n=>n.id))).map(id=>({id}));

const graphData = {

nodes: uniqueNodes.map(n=>({
id:n.id,
color: hazards[n.id] ? "#ff3b3b" : "#00c2ff"
})),

links: edges.map(e=>({
source:e[0],
target:e[1]
}))

};


/* ---------- CHART DATA ---------- */

const zoneChartData = Object.keys(zones).map(zone => ({
name: zones[zone]?.name || zone,
severity: hazards[zone]?.severity || 0
}));


return(

<div style={{
display:"flex",
height:"100vh",
background:"#0b132b",
color:"white",
fontFamily:"Arial"
}}>

{/* LEFT PANEL */}

<div style={{
width:"260px",
padding:"20px",
borderRight:"1px solid #1c2541",
overflowY:"auto"
}}>

<h2>👷 Workers</h2>

{Object.keys(workers).map(w=>
<div key={w}>
{w} → {zones[workers[w]]?.name || workers[w]}
</div>
)}

<h2 style={{marginTop:"20px"}}>⚠ Hazards</h2>

{Object.keys(hazards).map(z=>
<div key={z} style={{color:"#ff6b6b"}}>
{zones[z]?.name || z} → {hazards[z].type}
</div>
)}

<h2 style={{marginTop:"20px"}}>🧭 Route</h2>

<div style={{color:"#00ffae"}}>
{route.join(" → ")}
</div>

{/* IMPROVED CHART */}

<h2 style={{marginTop:"25px"}}>📊 Zone Risk Monitoring</h2>

<div style={{height:"260px"}}>

<ResponsiveContainer width="100%" height="100%">

<BarChart
data={zoneChartData}
margin={{ top:10, right:20, left:0, bottom:5 }}
>

<CartesianGrid strokeDasharray="3 3" stroke="#444"/>

<XAxis
dataKey="name"
stroke="#ccc"
tick={{fontSize:10}}
angle={-20}
textAnchor="end"
/>

<YAxis
stroke="#ccc"
label={{ value:"Severity", angle:-90, position:"insideLeft" }}
/>

<Tooltip
contentStyle={{
background:"#1c2541",
border:"none",
color:"white"
}}
/>

<Legend/>

<Bar dataKey="severity">

{zoneChartData.map((entry,index)=>{

let color="#00c2ff";

if(entry.severity > 70) color="#ff3b3b";
else if(entry.severity > 30) color="#ffaa00";

return <Cell key={index} fill={color}/>

})}

</Bar>

</BarChart>

</ResponsiveContainer>

</div>

</div>


{/* CENTER GRAPH */}

<div style={{
flex:1,
display:"flex",
flexDirection:"column",
alignItems:"center",
justifyContent:"center"
}}>

<h1 style={{marginBottom:"10px"}}>
🚨 AI Mine Emergency Control Center
</h1>

<div style={{width:"900px",height:"600px"}}>

<ForceGraph2D

graphData={graphData}

width={900}
height={600}

linkColor={()=>"#ffffff"}
linkWidth={2}

nodeRelSize={10}

nodeLabel={(node)=>{

const zoneName = zones[node.id]?.name || node.id;
const hazard = hazards[node.id];

if(hazard){
return `${zoneName} | Danger: ${hazard.type}`;
}

return zoneName;

}}

nodeCanvasObject={(node, ctx, globalScale)=>{

const label = zones[node.id]?.name || node.id;

ctx.beginPath();
ctx.arc(node.x,node.y,10,0,2*Math.PI);

ctx.fillStyle=node.color;
ctx.fill();

ctx.fillStyle="white";
ctx.font=`${14/globalScale}px Sans-Serif`;

ctx.fillText(label,node.x+12,node.y+4);

/* DRAW WORKERS */

Object.keys(workers).forEach(worker=>{

if(workers[worker] === node.id){

ctx.font=`${20/globalScale}px Sans-Serif`;
ctx.fillText("👷",node.x-8,node.y-16);

}

});

}}

enableZoomInteraction
enablePanInteraction

/>

</div>

</div>


{/* RIGHT PANEL */}

<div style={{
width:"260px",
padding:"20px",
borderLeft:"1px solid #1c2541"
}}>

<h2>⚙ Controls</h2>

<button style={btn} onClick={moveWorkers}>
Move Workers
</button>

<button style={btn} onClick={triggerHazard}>
Trigger Explosion
</button>

<button style={btn} onClick={spreadHazard}>
Spread Hazard
</button>

<button style={btn} onClick={evacuate}>
Evacuate Worker
</button>

</div>

</div>

);

}


const btn={
display:"block",
width:"100%",
marginTop:"12px",
padding:"10px",
background:"#1c2541",
color:"white",
border:"none",
borderRadius:"6px",
cursor:"pointer"
};

export default App;