<template>
  <div>
    <form v-on:submit.prevent="onSubmit">
      <label for="course">I want to take </label>
      <input class="uppercase" type="text" autofocus="autofocus" name="Course ID" v-model="targetCourseId" size="8" maxlength="8">
      <input type="button" v-on:click="onSubmit" value="View Graph">
    </form>
    <svg>
      <defs>
        <marker id="m-end" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
          <path d="M0,0 L0,6 L9,3 z"></path>
        </marker>
      </defs>
    </svg>
    <d3-network ref='net' :net-nodes="nodes" :net-links="links" :options="options" :link-cb="lcb" />
  </div>
</template>

<script>
import axios from "axios";
import D3Network from "vue-d3-network";

export default {
  name: "home",
  data() {
    return {
      targetCourseId: "CMSC451",
      uniqueNodes: {}, // "CMSC216": true
      nodes: [], // {id: "CMSC216", name: "CMSC216"}
      links: [], // {sid: "CMSC132", tid: "CMSC216"}
      options: {
        force: 3000,
        nodeSize: 20,
        linkWidth: 2,
        nodeLabels: true
      }
    };
  },
  components: {
    D3Network
  },
  mounted() {
    this.onSubmit();
  },
  methods: {
    onSubmit() {
      this.targetCourseId = this.targetCourseId.toUpperCase();
      // reset graph
      this.uniqueNodes = {
        [this.targetCourseId]: true
      };
      this.links = [];
      this.nodes = [
        {
          id: this.targetCourseId,
          name: this.targetCourseId,
          _color: "#e03a3e"
        }
      ];

      this.recursivelyGetAllPrereqs(this.targetCourseId);
    },
    recursivelyGetAllPrereqs(course_id) {
      // TODO not catching all errors yet
      axios
        .get(`https://api.umd.io/v0/courses/${course_id}`)
        .then(res => {
          const hasPrereqs = res.data.relationships.prereqs ? true : false;
          if (hasPrereqs) {
            const parsePrereqs = str => str.match(/[A-Z]{4}[0-9]{3}[A-Z]?/g);
            let prereqs = parsePrereqs(res.data.relationships.prereqs);

            // if course lists itself as a prereq then remove it
            let indexOfCourseItself = prereqs.indexOf(course_id);
            if (indexOfCourseItself > -1) {
              prereqs.splice(indexOfCourseItself, 1);
            }

            prereqs.forEach(prereq => {
              if (!this.uniqueNodes[prereq]) {
                this.uniqueNodes[prereq] = true;
                this.nodes.push({
                  id: prereq,
                  name: prereq,
                  _color: "#ffd520"
                });
              }

              this.links.push({
                sid: prereq,
                tid: course_id,
                _color: "#d1caca"
              });

              this.recursivelyGetAllPrereqs(prereq);
            });
          }
        })
        .catch(err => {
          console.log(err);
        });
    },
    lcb(link) {
      link._svgAttrs = {
        "marker-end": "url(#m-end)"
      };
      return link;
    }
  }
};
</script>

<style>
html {
  background-color: #fff7f7;
  font-family: monospace;
  font-weight: bold;
  font-size: 16px;
}

.uppercase {
  text-transform: uppercase;
}

.node-label {
  font-size: 1rem;
}

#m-end {
  margin: 10px;
  fill: #d1caca;
}
</style>