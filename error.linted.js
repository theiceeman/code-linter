let theText = 'abcd1234' + 'cdefghi3393';

let neverReassigned = {};
neverReassigned.name = 'ebube okorie';
theText = 12223;

let toBeReassigned = {};
toBeReassigned = {
  name: 'ana'
};
toBeReassigned.name = 1;
toBeReassigned = 0;
toBeReassigned = {
  name: 'ana'
};

const result = text.split(',').map(letter => {
  return letter.toUpperCase();
}).join('.');
console.log(result);
