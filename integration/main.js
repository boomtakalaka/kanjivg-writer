import {createWriter} from '../dist/index'

console.log('hello');

const canvas = document.getElementById('canvas');
createWriter(canvas, {
  kanji: '漢'
});
