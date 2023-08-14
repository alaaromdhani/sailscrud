module.exports = {
  getCurrentTrimestre: () => {
    const getAnneeScolaire = () => {
      let currentDate = new Date();
      let currentMonth = currentDate.getMonth();
      if (currentMonth >= 8 && currentMonth <= 11) {
        return [currentDate.getFullYear(), currentDate.getFullYear() + 1];
      } else {
        return [currentDate.getFullYear() - 1, currentDate.getFullYear()];
      }
    };
    let [beginningDate, endingDate] = getAnneeScolaire();
    let currentTrimestre =[
      { trimestre: 1, startingDate: new Date(beginningDate, 8, 15) },
      { trimestre: 2, startingDate: new Date(endingDate, 0, 1) },
      { trimestre: 3, startingDate: new Date(endingDate, 2, 15) },
      { trimestre: 4, startingDate: new Date() },
    ]
      .sort((d1, d2) => {
        return d1.startingDate - d2.startingDate;
      })
      .map((d) => d.trimestre)
      .indexOf(4);
      return currentTrimestre
  },
};
