// parse prereqs (one level deep)
// see tests/ for more details
function parsePrereqs(str) {
  let prereqs = {
    mustTake: [], // courses that must absolutely be taken

    // sometimes a prerequisite is one of several
    pickOneFromEach: [] // an array of arrays of course ids
  };

  prereqs.mustTake = str.match(/[A-Z]{4}[0-9]{3}[A-Z]?/g);

  if (str.includes("from")) {
    const regex = /from \(([A-Z|0-9|,| ]*)\)/g;
    let pickOneFrom;

    while ((pickOneFrom = regex.exec(str)) !== null) {
      prereqs.pickOneFromEach.push(pickOneFrom[1].split(", "));
    }

    for (let i = 0; i < prereqs.pickOneFromEach.length; i++) {
      prereqs.mustTake = prereqs.mustTake.filter(
        course => !prereqs.pickOneFromEach[i].includes(course)
      );
    }
  }

  if (prereqs.mustTake == null) {
    prereqs.mustTake = [];
  }

  return prereqs;
}

export default parsePrereqs;
