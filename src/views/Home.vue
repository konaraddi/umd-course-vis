<template>
  <div class="home has-text-centered">

    <form class="form" v-on:submit.prevent="onSubmit">
      <label for="course">I want to take </label>
      <input class="uppercase" type="text" autofocus="autofocus" name="Course ID" v-model="targetCourseId" size="7" maxlength="7">
      <br><br>
      <input type="submit" value="view graph">
    </form>

    <div v-if="errorMessage">
      <br> <br> <br>
      <p v-html="errorMessage"></p>
    </div>
    <div v-else>
      <d3-graph :nodes="nodes" :links="links"/>

      <div v-if="pickOneFromEach.length > 0">
        In addition to the above, pick one from <span v-if="pickOneFromEach.length > 1">each</span><span v-else>the</span> set below:
        <p v-for="(set, index) in pickOneFromEach" :key="index">
          <a target="_blank" v-for="(course_id, i) in set" :href="baseUrl+'/#/'+course_id" :key="i">{{course_id}}<br></a>
        </p>
      </div>
    </div>

  </div>
</template>

<script>
import axios from "axios";
import D3Graph from "../components/D3Graph.vue";
import parsePrereqs from "../parsePrereqs";

export default {
  name: "home",
  components: {
    D3Graph
  },
  data() {
    return {
      baseUrl: window.location.protocol + "//" + window.location.host,
      errorMessage: null,
      pickOneFromEach: [],
      targetCourseId: this.$route.params.course_id || "CMSC216",
      uniqueNodes: {}, // "CMSC216": true
      nodes: [], // {id: "CMSC216", name: "CMSC216"}
      links: [] // {sid: "CMSC132", tid: "CMSC216"}
    };
  },
  mounted() {
    this.onSubmit();
  },
  methods: {
    onSubmit() {
      this.targetCourseId = this.targetCourseId.toUpperCase();
      this.$router.push({
        name: "home",
        params: { course_id: this.targetCourseId }
      });
      // reset graph
      this.uniqueNodes;
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
      this.pickOneFromEach = [];
      this.errorMessage = null;

      this.recursivelyGetAllPrereqs(this.targetCourseId);
    },
    recursivelyGetAllPrereqs(course_id) {
      // TODO not catching all errors yet
      axios
        .get(`https://api.umd.io/v0/courses/${course_id}`)
        .then(res => {
          const prereqsAsString = res.data.relationships.prereqs;

          const prereqs = prereqsAsString
            ? parsePrereqs(prereqsAsString)
            : null;

          // handle the oneFromEach portion of prereqs (see parsePrereqs function and tests for details)
          if (prereqs != null) {
            // if course lists itself as a prereq then remove it
            let indexOfCourseItself = prereqs.mustTake.indexOf(course_id);
            if (indexOfCourseItself > -1) {
              prereqs.mustTake.splice(indexOfCourseItself, 1);
            }

            prereqs.mustTake.forEach(prereq => {
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

            if (course_id == this.targetCourseId) {
              prereqs.pickOneFromEach.forEach(set => {
                this.pickOneFromEach.push(set);
              });
            }
          }
        })
        .catch(err => {
          /**
           * We have to catch errors in a convoluted way because axios cannot
           * properly catch errors from api.umd.io
           * All error messages are logged to the
           * console but those messages cannot be caught.
           * This could be an issue with axios, the API server, or my code (in
           * order of least to most likely culprit).
           */
          if (err.request) {
            // Either not a course or the user is offline
            // so let's check if they're online
            if (navigator.onLine) {
              // connected to internet
              // so it's not a course
              this.errorMessage = `Hey, that's not a course!<br>Try a course from  <a href="https://app.testudo.umd.edu/soc/" target="_blank">this list</a> or "CMSC420"`;
            } else {
              // not connected to the Internet
              // ...and maybe it's not a course
              this.errorMessage = "Hmmm, looks like you're offline!";
            }
          } else {
            this.errorMessage = "Oops, something went wrong :/";
          }
        });
    }
  }
};
</script>

<style lang="scss">
.form {
  margin-top: 48px;
}

.has-text-centered {
  text-align: center;
}

.uppercase {
  text-transform: uppercase;
}

input[type="text"] {
  border: 0;
  outline: 0;
  background: transparent;
  border-bottom: 3px solid black;

  &:focus {
    border-bottom: 3px solid rgb(224, 58, 62);
  }
}

input[type="submit"] {
  margin-left: 12px;
  border: 3px solid black;
  outline: 0;
  background: transparent;

  &:hover {
    border: 3px solid rgb(224, 58, 62);
    color: rgb(224, 58, 62);
  }
}

input {
  font-family: inherit;
  font-weight: inherit;
  font-size: inherit;
}
</style>
