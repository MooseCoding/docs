// simple css

import 'simpledotcss/simple.css'

// highlightjs's css:

import 'highlight.js/styles/base16/gruvbox-dark-hard.css';

// my css

import '/main.css'

// line hiding

import eye from '/components/fa-eye.svg?raw'
import eyeSlash from '/components/fa-eye-slash.svg?raw'

document.querySelectorAll('.reveal-hidden-code').forEach(button => {
  const code = button.parentNode
  let show = true;
  button.addEventListener('click', function(e) {
    if (show) {
      this.innerHTML = eyeSlash;
      this.title = 'Hide lines';
      this.setAttribute('aria-label', e.target.title);

      code.classList.remove('hide-boring');
      show = false;
    }
    else {
      this.innerHTML = eye;
      this.title = 'Show hidden lines';
      this.setAttribute('aria-label', e.target.title);

      code.classList.add('hide-boring');
      show = true;
    }
  });
});

//Array.from(document.querySelectorAll('code.hljs')).forEach((block) => {
//  const lines = Array.from(block.querySelectorAll('.boring'));
//  // If no lines were hidden, return
//  // TODO: re-enable
//  //if (!lines.length) {
//  //  return;
//  //}
//  block.classList.add('hide-boring');
//
//  const buttons = document.createElement('div');
//  buttons.className = 'buttons';
//  buttons.innerHTML = '<button title="Show hidden lines" \
//  aria-label="Show hidden lines"></button>';
//  buttons.firstChild.innerHTML = eye
//
//  // add expand button
//  const pre_block = block.parentNode;
//  pre_block.insertBefore(buttons, pre_block.firstChild);
//
//  buttons.firstChild.addEventListener('click', function(e) {
//    if (this.title === 'Show hidden lines') {
//      this.innerHTML = eyeSlash
//      this.title = 'Hide lines';
//      this.setAttribute('aria-label', e.target.title);
//
//      block.classList.remove('hide-boring');
//    } else if (this.title === 'Hide lines') {
//      this.innerHTML = eye
//      this.title = 'Show hidden lines';
//      this.setAttribute('aria-label', e.target.title);
//
//      block.classList.add('hide-boring');
//    }
//  });
//});

