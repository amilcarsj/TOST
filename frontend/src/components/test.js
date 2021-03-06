import React, { useState, useEffect } from 'react';
import 'parasol-es/dist/parcoords.css';
import Parasol from 'parasol-es';
import * as d3 from "d3";


// update clustering
function update_cluster_slider(nClust) {
  // adjust the text on the range slider
  d3.select("#nClust-value").text(nClust);
  d3.select("#nClust").property("value", nClust);
}

function get_checked_vars() {
  // create an array of variables that are checked for clustering
  var checked_vars = [];
  var checkbox_ids = ["#econ_box", "#cyl_box", "#disp_box", "#pow_box",
  "#wgt_box", "#accel_box", "#year_box"];
  var var_names = ["economy (mpg)", "cylinders", "displacement (cc)",
  "power (hp)", "weight (lb)", "0-60 mph (s)", "year"];

  // get whether each checkbox is checked, if so, add var to cluster_vars
  for (var i=0; i < checkbox_ids.length; i++) {
    if (d3.select(checkbox_ids[i]).property("checked") === true) {
      checked_vars.push(var_names[i]);
    }
  }
  return checked_vars;
}

export const Test = ({ data }) => {
  useEffect(() => {
    // d3.csv(process.env.PUBLIC_URL + 'cars.csv').then(function(data) {

      // specify initial number of clusters (k)
      const k=3;
      // update_cluster_slider(k);
      var cluster_vars = d3.keys(data[0]).filter(function(key) {
        return key !== 'trip_id' && key !== 'timestamp_in_millis';
      });

      // divide data into two plots
      var layout = {
          0: ['min_sog', 'avg_sog', , 'max_sog', 'start_heading', 'end_heading', 'max_heading_change', 'distance_in_nm', 'duration_in_sec']
        }

      // create Parasol object, add grid, link, and perform clustering
      var ps = Parasol(data)('.parcoords')
                .attachGrid({container: '#grid'})
                .linked()
                .cluster({k: k, vars: cluster_vars, hidden: true})
                .setAxesLayout(layout)
                .alpha(0.2)  // change transparency
                .reorderable()  // make axes dynamically reorderable
                .render()

      // update clusters and slider text when slider changes
      d3.select('#nClust').on('input', function() {
        update_cluster_slider(+this.value);  // update slider text
        // var checked_vars = get_checked_vars();  // get checked variables for clustering
        // ps.cluster({k: parseInt(this.value), vars: checked_vars, hidden: true});
        ps.cluster({k: parseInt(this.value)});
      });
    // });
  }, [])

  return (
    <>
      <h1> k-Means clustering and linked grid</h1>
      <div>
        <p> Variables to include in clustering: <br/>
        <input type="checkbox" id="avg_sog" checked/> economy (mpg) <br/>
        <input type="checkbox" id="cyl_box" checked/> cylinders <br/>
        <input type="checkbox" id="disp_box" checked/> displacement (cc) <br/>
        <input type="checkbox" id="pow_box" checked/> power (hp) <br/>
        <input type="checkbox" id="wgt_box" checked/> weight (lb) <br/>
        <input type="checkbox" id="accel_box" checked/> 0-60 mph (s) <br/>
        <input type="checkbox" id="year_box" checked/> year <br/>
        </p>
        <label htmlFor="nClust" style={{display: 'inline-block', textAlign: 'left'}}>
          Clusters: <span id="nClust-value" />
        </label>
        <input type="range" min="2" max="10" id="nClust" />
        <p> <i>Note: clustering is updated every time slider changes</i>. </p>
      </div>

      <div id="p0" className="parcoords" style={{height: '300px', width: '1200px'}}></div>
      <div id="grid" style={{width:'100%', height:'500px'}} className="slickgrid-container"></div>
    </>
  )
}
