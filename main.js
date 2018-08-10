const D3Network = window["vue-d3-network"];

new Vue({
  el: "#app",
  data: {
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
});
