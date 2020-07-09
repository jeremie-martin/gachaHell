<template>
  <div class="wrapper">
    <div class="sliderComp">
      <h3>Probability</h3>
      <vue-slider
        class="slider"
        v-model="proba"
        :drag-on-click="true"
        :tooltip="'always'"
        :min="0"
        :max="0.05"
        :interval="0.001"
        :marks="marks"
        :height="10"
        :dot-size="20"
        @dragging="drag()"
        ref="slider1"
        >
        <template v-slot:label="{ label, active }">
          <div :class="['vue-slider-mark-label', 'custom-label', { active }]">{{ label*100 + "%" }}</div>
        </template>
      </vue-slider>

      <h3>Number of successes</h3>
      <vue-slider
        class="slider"
        v-model="succNB"
        :drag-on-click="true"
        :tooltip="'always'"
        :min="0"
        :max="20"
        :interval="1"
        :marks="marks"
        :height="10"
        :dot-size="15"
        ref="slider"
        @dragging="drag()"
        >
        <template v-slot:label="{ label, active }">
          <div :class="['vue-slider-mark-label', 'custom-label', { active }]">{{ label }}</div>
        </template>
      </vue-slider>

      <vue-good-table
        :columns="columns"
        :rows="tries"/>
    </div>

    <div class="sliderComp">
      <h3>Density</h3>
      <scatter-chart :chart-data="datacollection" id="mychart"></scatter-chart>
    </div>
  </div>
</template>

<script>
import VueSlider from 'vue-slider-component'
import 'vue-slider-component/theme/antd.css'
//import Raphael from 'raphael/raphael'
//global.Raphael = Raphael
// import { LineChart } from 'vue-morris'
import ScatterChart from "../ScatterChart.js";

var size = 5000;
var logf = new Array(size);
var pcum = new Array(size);

logf[0] = 0;
for (var i = 1; i <= size; ++i) logf[i] = logf[i - 1] + Math.log(i);

function binomial(n, k) {
  return Math.exp(logf[n] - logf[n - k] - logf[k]);
}

function binomialProbability(trials, successes, p) {
  if(successes > trials) {
    return 0;
  }
  return (
    binomial(trials, successes) *
    Math.pow(p, successes) *
    Math.pow(1 - p, trials - successes)
  );
}

function compute(N, k, p, find = "<") {
  let cumulative = 0;

  if (find == "=") {
    return binomialProbability(N, k, p);
  }

  if (find == "<" || find == ">=") {
    k = k - 1;
  }

  for (let i = 0; i <= k; ++i) {
    cumulative = cumulative + binomialProbability(N, i, p);
  }

  if (find.includes("<")) {
    return cumulative;
  } else {
    return 1 - cumulative;
  }
}

function closest (arr, x) {
    /* lb is the lower bound and ub the upper bound defining a subarray or arr. */
    var lb = 0, 
        ub = arr.length - 1 ;
    /* We loop as long as x is in inside our subarray and the length of our subarray is greater than 0 (lb < ub). */
    while (ub - lb > 1) {
        var m = parseInt((ub - lb + 1) / 2) ; // The middle value
        /* Depending on the middle value of our subarray, we update the bound. */
        if (arr[lb + m] > x) {
            ub = lb + m ;
        }
        else if (arr[lb + m] < x) {
            lb = lb + m ;
        }
        else {
            ub = lb + m ; lb = lb + m ;
        }
    }
    /* After the loop, we know that the closest value is either the one at the lower or upper bound (may be the same if x is in arr). */
    var clst = lb ;
    if (Math.abs(arr[lb] - x) > Math.abs(arr[ub] - x)) {
        clst = ub ;
    }
    return clst ; // If you want the value instead of the index, return arr[clst]
}

export default {
  components: {
    VueSlider,
    ScatterChart,
  },
  data: function () {
    return {
      datacollection: null,
      proba: 0.01,
      succNB: 2,
      CIs: [0.75, 0.90, 0.95, 0.98, 0.99],
      columns: [
        {
          label: 'P >=',
          field: 'ci',
          type: 'number',
          thClass: 'text-center',
        },
        {
          label: '# Runs',
          field: 'N',
          type: 'number',
          thClass: 'text-center',
        },
      ],
      tries: [],
      plotD: [],
      marks: val => (val*2000) % 20 === 0
    }
  },
  methods: {
    findN(k, p, CI, start = 0) {
      var best = 100000000;
      var bestN = 0;

      for (let i = start; i <= size; ++i) {
        var tmp = compute(i, k, p, ">=");
        if (Math.abs(tmp - CI) < best) {
          best = Math.abs(tmp - CI);
          bestN = i;
        }
      }
      return bestN;
    },
    drag() {
      var N = this.succNB;
      this.tries = []
      this.plotD = []
      pcum = []
      var p = []
      for (let i = 0; i <= size; i++) {
        pcum.push(compute(i, this.succNB, this.proba, ">"));
        p.push(compute(i, this.succNB, this.proba, "="));
        pcum[i] += p[i];
        this.plotD.push({"x": i, "y": p[i]});
        if((p[i] < p[i-1]) && (p[i] < 0.0001)) {
          break;
        }
      }

      for(var i = 0; i < p.length && this.plotD.length < 20; i += Math.ceil(p.length / 20)) {
          this.plotD.push({"x": i, "y": p[i]});
          // this.plotD.push(p[i]);
      }

      this.datacollection = {
        datasets: [
          {
            backgroundColor: "#1A73E8",
            fontSize: 12,
            data: this.plotD,
            showLine: true,
            pointRadius: 0,
            pointHoverRadius: 5,
          }
        ],
                options: {
          legend: {
            display: false,
        },
        scales: {
        xAxes: [{
            type: 'linear',
            fontSize: 12
            // ...
        }],
        yAxes: [{
            fontSize: 12
            // ...
        }]
        }
                }
      };
      
      for (let ci of this.CIs) {
        N = closest(pcum, ci);
        //N = this.findN(this.succNB, this.proba, ci, N);
        
        this.tries.push({"ci": ci, "N": N});
      }
    }
  },
  beforeMount() {
    //this.tries = .reduce((a,b) => (a[b] = 0, a), {});

    this.drag()
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  padding-bottom: 28px;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}

.wrapper {
    display: flex;
    justify-content: space-around;
    flex-wrap: wrap;
    padding: 0 3%;
}

.text-center {
    text-align: center;
    font-size: 30px;
}

.sliderComp {
    width: 45%;
    display: inline-block;
    padding-left: 5px;
    padding-right: 5px;
    vertical-align: top;
}

.slider {
    margin-bottom: 40px;
}

.custom-step {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  box-shadow: 0 0 0 3px #ccc;
  background-color: #fff;
}
.custom-step.active {
  box-shadow: 0 0 0 3px #3498db;
  background-color: #3498db;
}
</style>
