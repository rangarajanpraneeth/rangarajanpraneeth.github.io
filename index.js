// class Shuffle {
//    constructor(element) {
//       this.element = element;
//       this.characters = '01';
//       this.update = this.update.bind(this);
//    }

//    setText(newText) {
//       const oldText = this.element.innerText;
//       const length = Math.max(oldText.length, newText.length);
//       const promise = new Promise((resolve) => this.resolve = resolve);
//       this.queue = []

//       for (let i = 0; i < length; i++) {
//          const from = oldText[i] || '';
//          const to = newText[i] || '';

//          const start = Math.floor(Math.random() * 50);
//          const end = start + Math.floor(Math.random() * 50);

//          this.queue.push({
//             from,
//             to,
//             start,
//             end
//          });
//       }

//       cancelAnimationFrame(this.frameRequest);
//       this.frame = 0;
//    }
// }