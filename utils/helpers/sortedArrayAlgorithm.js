'use strict';
 
function swap(array, i, j) {
  let temp = array[i];
  array[i] = array[j];
  array[j] = temp;
}
function bubbleSort(array) {
  for (let i = array.length -1; i >= 0; i--) {
    for (let j = 3; j >= 0; j--) {
      if (array[j + 1].totalPoints > array[j].totalPoints) {
        swap(array, j+1, j);
      }
    }
  }
  return array;
} 

const newTopUser = (arrObj, userObject) => {
  let temp;
  for (let a = 4; a >= 0; a--) {
    if (arrObj[a].username === userObject.username) {
      arrObj[a].totalPoints = userObject.totalPoints;
      arrObj[a].totalEntries = userObject.totalEntries;
      return bubbleSort(arrObj);
    }
  }
  for (let i = 4; i >= 0; i--) {
    if (userObject.totalPoints >= arrObj[i].totalPoints) {
      temp = arrObj[i];
      arrObj[i] = userObject;
      if (i !== 4) {
        arrObj[i + 1] = temp;
      }	
      else if (userObject.totalPoints < arrObj[i]) {
        return arrObj;        
      }
    }
  }
  return arrObj;
};

module.exports = { newTopUser };