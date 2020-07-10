<template>
  <div>
    <v-app>
      <v-content class="wrapper">
        <div v-bind:class="getSliderComp()">
          <h2>Input</h2>
          <div v-bind:class="getH3Input()" id="padBot">
            <div>
              <h3 id="padRight">Drop / Pull rate</h3>
            </div>
            <div>
              <VueNumberInput
                v-model="rate"
                :min="0"
                :max="0.05"
                :step="0.001"
                @change="drag()"
                inline
                center
                controls
              />
            </div>
          </div>
          <vue-slider
            class="slider"
            v-model="rate"
            :drag-on-click="true"
            :tooltip="'none'"
            :min="0"
            :max="0.05"
            :interval="0.001"
            :marks="marks"
            :height="10"
            :dot-size="20"
            :process-style="{ backgroundColor: '#9dd8ff' }"
            @dragging="drag()"
            ref="slider1"
          >
            <template v-slot:step="{ label, active }">
              <div :class="['custom-step', { active }]"></div>
            </template>
          </vue-slider>

          <div v-bind:class="getH3Input()" id="padBot">
            <div>
              <h3 id="padRight">Number of successes</h3>
            </div>
            <div>
              <VueNumberInput
                v-model="succNB"
                :min="0"
                :max="2000"
                @change="drag()"
                inline
                center
                controls
              />
            </div>
          </div>
          <vue-slider
            class="slider"
            v-model="succNB"
            :drag-on-click="none"
            :tooltip="'none'"
            :min="0"
            :max="20"
            :interval="1"
            :marks="marksSucc"
            :height="10"
            :dot-size="20"
            :process-style="{ backgroundColor: '#9dd8ff' }"
            @dragging="drag()"
            ref="sliderRuns"
          >
            <template v-slot:step="{ label, active }">
              <div :class="['custom-step', { active }]"></div>
            </template>
          </vue-slider>

          <div v-bind:class="getH3Input()" id="padBot">
            <div>
              <h3 id="padRight">Number of trials</h3>
            </div>
            <div>
              <VueNumberInput
                v-model="runNB"
                :min="0"
                :max="2000"
                @change="drag()"
                inline
                center
                controls
              />
            </div>
          </div>
          <vue-slider
            class="slider"
            v-model="runNB"
            :drag-on-click="true"
            :tooltip="'none'"
            :min="0"
            :max="2000"
            :interval="1"
            :marks="marksRuns"
            :height="10"
            :dot-size="20"
            :process-style="{ backgroundColor: '#a2ea8c' }"
            @dragging="drag()"
            ref="sliderRuns"
          >
            <template v-slot:step="{ label, active }">
              <div :class="['custom-stepRuns', { active }]"></div>
            </template>
          </vue-slider>

          <div v-bind:class="getH3Input()" id="padBot">
            <div>
              <h3 id="padRight">Probability</h3>
            </div>
            <div>
              <VueNumberInput
                v-model="proba"
                :min="0"
                :max="1"
                :step="0.001"
                @change="drag()"
                inline
                center
                controls
              />
            </div>
          </div>
          <vue-slider
            class="slider"
            v-model="proba"
            :drag-on-click="true"
            :tooltip="'none'"
            :min="0.5"
            :max="1"
            :interval="0.001"
            :marks="marksProba"
            :height="10"
            :dot-size="20"
            :process-style="{ backgroundColor: '#ffd99d' }"
            @dragging="drag()"
            ref="slider1"
          >
            <template v-slot:step="{ label, active }">
              <div :class="['custom-stepProba', { active }]"></div>
            </template>
          </vue-slider>
          <!-- <scatter-chart :chart-data="datacollection" id="mychart"></scatter-chart> -->
        </div>

        <div v-bind:class="getSliderComp()">
          <h2>Results</h2>

          <vue-good-table
            :columns="columns"
            :rows="tries"
            :sort-options="{
        enabled: true,
      }"
          >
            <template slot="table-row" slot-scope="props">
              <span v-if="props.row.active === 1">
                <span style="font-weight: bold; color: #53c82f;">{{props.row[props.column.field]}}</span>
              </span>
              <span v-else-if="props.row.active === 2">
                <span style="font-weight: bold; color: #e48f20;">{{props.row[props.column.field]}}</span>
              </span>
              <span v-else>{{props.formattedRow[props.column.field]}}</span>
            </template>
            <template slot="table-column" slot-scope="props">
              <span v-if="props.column.label =='P >= '">{{"Prob of getting >= " + succNB}}</span>
              <span v-else>{{props.column.label}}</span>
            </template>
          </vue-good-table>
        </div>
      </v-content>

      <v-footer>
        <v-spacer></v-spacer>
        <div>
          <p>
            <span class="copy-left">©</span>
            Martin Jérémie
            ({{ new Date().getFullYear() }})
            <a
              href="https://github.com/jeremie-martin/gachaHell"
            >github</a>
          </p>
        </div>
      </v-footer>
    </v-app>
  </div>
</template>

<script>
import VueSlider from "vue-slider-component";
import "vue-slider-component/theme/default.css";
import VueNumberInput from "@chenfengyuan/vue-number-input";

//import Raphael from 'raphael/raphael'
//global.Raphael = Raphael
// import { LineChart } from 'vue-morris'
// import ScatterChart from "../ScatterChart.js";

var size = 10000;
var logf = new Array(size);
var pcum = new Array(size);

logf[0] = 0;
for (var i = 1; i <= size; ++i) logf[i] = logf[i - 1] + Math.log(i);

function binomial(n, k) {
  return Math.exp(logf[n] - logf[n - k] - logf[k]);
}

function binomialProbability(trials, successes, p) {
  if (successes > trials) {
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

function closest(arr, x) {
  /* lb is the lower bound and ub the upper bound defining a subarray or arr. */
  var lb = 0,
    ub = arr.length - 1;
  /* We loop as long as x is in inside our subarray and the length of our subarray is greater than 0 (lb < ub). */
  while (ub - lb > 1) {
    var m = parseInt((ub - lb + 1) / 2); // The middle value
    /* Depending on the middle value of our subarray, we update the bound. */
    if (arr[lb + m] > x) {
      ub = lb + m;
    } else if (arr[lb + m] < x) {
      lb = lb + m;
    } else {
      ub = lb + m;
      lb = lb + m;
    }
  }
  /* After the loop, we know that the closest value is either the one at the lower or upper bound (may be the same if x is in arr). */
  var clst = lb;
  if (Math.abs(arr[lb] - x) > Math.abs(arr[ub] - x)) {
    clst = ub;
  }
  return clst; // If you want the value instead of the index, return arr[clst]
}

export default {
  components: {
    VueSlider,
    VueNumberInput
    // ScatterChart
  },
  data: function() {
    return {
      datacollection: null,
      runNB: 250,
      rate: 0.01,
      proba: 0.925,
      succNB: 2,
      CIs: [0.75, 0.9, 0.95, 0.98, 0.99],
      columns: [
        {
          label: "P >= ",
          field: "ci",
          type: "number",
          thClass: "text-center",
          tdClass: "text-center"
        },
        {
          label: "# Trials",
          field: "N",
          type: "number",
          thClass: "text-center",
          tdClass: "text-center"
        }
      ],
      tries: [],
      plotD: [],
      marks: val =>
        (val * 2000) % 20 === 0
          ? {
              label: `${val * 100}%`
            }
          : false,
      marksProba: val =>
        (val * 200) % 20 === 0
          ? {
              label: `${val * 100}%`
            }
          : false,
      marksRuns: val => val % 250 === 0,
      marksSucc: val => val % 2 === 0
    };
  },
  methods: {
    isMobile() {
      return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );
    },
    getH3Input() {
      if (this.isMobile()) {
        return "";
      } else {
        return "h3InputDesktop";
      }
    },
    getSliderComp() {
      if (this.isMobile()) {
        return "sliderCompMobile";
      } else {
        return "sliderCompDesktop";
      }
    },
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
      this.tries = [];
      this.plotD = [];
      pcum = [];
      var p = [];
      var ciToAdd;
      for (let i = 0; i <= size; i++) {
        pcum.push(compute(i, this.succNB, this.rate, ">"));
        p.push(compute(i, this.succNB, this.rate, "="));
        pcum[i] += p[i];
        if (i == this.runNB) {
          ciToAdd = pcum[i];
        }
        this.plotD.push({ x: i, y: p[i] });
        if (p[i] < p[i - 1] && p[i] < 0.0001 && i >= this.runNB) {
          break;
        }
      }

      for (
        var i = 0;
        i < p.length && this.plotD.length < 20;
        i += Math.ceil(p.length / 20)
      ) {
        this.plotD.push({ x: i, y: p[i] });
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
            pointHoverRadius: 5
          }
        ],
        options: {
          legend: {
            display: false
          },
          scales: {
            xAxes: [
              {
                type: "linear",
                fontSize: 12
                // ...
              }
            ],
            yAxes: [
              {
                fontSize: 12
                // ...
              }
            ]
          }
        }
      };

      this.CIs = [0.75, 0.9, 0.95, 0.98, 0.99];
      this.CIs.push(this.proba);
      this.CIs.push(ciToAdd);

      for (let ci of this.CIs) {
        N = closest(pcum, ci);
        //N = this.findN(this.succNB, this.proba, ci, N);
        this.tries.push({
          ci: `${parseFloat((ci * 100).toFixed(2))}%`,
          N: N,
          active: 0
        });
      }
      this.tries[this.tries.length - 1].active = 1;
      this.tries[this.tries.length - 2].active = 2;

      this.tries.sort((a, b) => a.N - b.N);
    }
  },
  beforeMount() {
    //this.tries = .reduce((a,b) => (a[b] = 0, a), {});

    this.drag();
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h2 {
  text-align: center;
}

#padBot {
  padding-bottom: 25px;
}

#padRight {
  padding-right: 20px;
  padding-bottom: 5px;
}

ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
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

.h3InputDesktop {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.inputNb {
  width: 200px;
}

.sliderCompDesktop {
  width: 45%;
  display: inline-block;
  padding-left: 5px;
  padding-right: 5px;
  vertical-align: top;
}

.sliderCompMobile {
  width: 90%;
  display: inline-block;
  padding-left: 5px;
  padding-right: 5px;
  vertical-align: top;
}

.slider {
  margin-left: 7px;
  margin-right: 7px;
  margin-bottom: 40px;
  margin-top: -25px;
}

.custom-step {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  box-shadow: 0 0 0 2px #ccc;
  background-color: #fff;
}
.custom-step.active {
  box-shadow: 0 0 0 2px #3498db;
  background-color: #3498db;
}

.custom-stepRuns {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  box-shadow: 0 0 0 2px #ccc;
  background-color: #fff;
}
.custom-stepRuns.active {
  box-shadow: 0 0 0 2px #53c82f;
  background-color: #53c82f;
}

.custom-stepProba {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  box-shadow: 0 0 0 2px #ccc;
  background-color: #fff;
}
.custom-stepProba.active {
  box-shadow: 0 0 0 2px #e48f20;
  background-color: #e48f20;
}

.copy-left {
  display: inline-block;
  text-align: right;
  margin: 0px;
  -moz-transform: scaleX(-1);
  -o-transform: scaleX(-1);
  -webkit-transform: scaleX(-1);
  transform: scaleX(-1);
  filter: FlipH;
  -ms-filter: “FlipH”;
}
</style>
