$(() => {  
  const LAYER_COUNT = 32;
  const TRANSITION_DURATION = 1.5;
  const TRANSITION_DELAY = 1.35;
  
  let currentLayerCount = LAYER_COUNT;
  
  const $target = $('#banner-message');
  const target = $target[0];
  
  const $effect = $('#effect');
  
  const hideTarget = () => {
  	$target.css({
    	'transition': `opacity ${TRANSITION_DURATION} ease`,
      opacity: 0
    });
    delay(1e3 * TRANSITION_DURATION).then(() => {
    	$target.css('visibility', 'hidden');
    });
  };
  
  const showTarget = () => {
  	$target.css({
    	opacity: 1,
      visibility: 'visible'
    });
  };
  
  // bind events
  
  var clicks = 0;
  $('#guantlet').on('click', function() {
    console.log('clicked' + clicks);
    if (clicks % 2 == 1) {
      setTimeout(showTarget, 2000);
    }else{
      setTimeout(function(){play(currentLayerCount)}, 2000);
    };
    return clicks+=1;
  });
  
  $('.js-play').on('click', function () {
  	play(currentLayerCount);
  });
  $('.js-reset').on('click', function () {
  	showTarget();
  });
  $('.js-alt').on('click', function($evt) {
    $('body').toggleClass('alt')
  	$target.toggleClass('alt', $evt.target.checked);
  });
  $('.js-border').on('change', function($evt) {
  	$effect.toggleClass('border', $evt.target.checked);
  });
  $('.js-layer-count').on('change', function($evt) {
  	currentLayerCount = Number($evt.target.value);
  });
  $('.js-layer-count').val(currentLayerCount);
  
  function play(layerCount) {
  	showTarget();
    
    const bRect = target.getBoundingClientRect();
    $effect.css({
      left: bRect.left,
      top: bRect.top,
      width: bRect.width,
      height: bRect.height
    });
    
    html2canvas(target, {
      backgroundColor: null,
    })
    .then(canvas => {
      const context = canvas.getContext('2d');
      const { width, height } = canvas;

      // get element imageData
      const imgData = context.getImageData(0, 0, width, height);

      // init empty imageData
      const effectImgDatas = [];
      for (let i = 0; i < layerCount; i++) {
        effectImgDatas.push(context.createImageData(width, height));
      }
      sampler(effectImgDatas, imgData, width, height, layerCount);

      // create cloned canvases
      for (let i = 0; i < layerCount; i++) {
        const canvasClone = canvas.cloneNode();
        canvasClone.getContext('2d').putImageData(effectImgDatas[i], 0, 0);

        const $canvas = $(canvasClone);
        const transitionDelay = TRANSITION_DELAY * (i / layerCount);
        $canvas.css('transition-delay', `${transitionDelay}s`);
        $effect.append($canvas);

        delay(0)
        .then(() => {
          const rotate1 = 15 * (Math.random() - .5);
          const rotate2 = 15 * (Math.random() - .5);
          const fac = 2 * Math.PI * (Math.random() - .5);
          const translateX = 60 * Math.cos(fac);
          const translateY = 30 * Math.sin(fac);

          $canvas.css({
            transform: `rotate(${rotate1}deg) translate(${translateX}px, ${translateY}px) rotate(${rotate2}deg)`,
            opacity: 0
          });

          const removeDelay = 1e3 * (TRANSITION_DURATION + 1 + Math.random());
          delay(removeDelay)
            .then(() => {
            $canvas.remove();
          });
        });

        hideTarget();
      }
    });
  }
  
  function sampler(imgDatas, sourceImgData, width, height, layerCount) {
  	for (let x = 0; x < width; x++) {
    	for (let y = 0; y < height; y++) {
      	for (let l = 0; l < 2; l++) {
        	// random piece index which tend to grow with x
        	const pieceIndex = Math.floor(layerCount * (Math.random() + 2 * x / width) / 3);
          const pixelPos = 4 * (y * width + x);
          for (let rgbaIndex = 0; rgbaIndex < 4; rgbaIndex++) {
          	const dataPos = pixelPos + rgbaIndex;
          	imgDatas[pieceIndex].data[dataPos] = sourceImgData.data[dataPos];
          }
        }
      }
    }
  }
  
  function delay(ms) {
  	return new Promise(resolve => {
    	setTimeout(() => {
      	resolve()
      }, ms);
    })
  }
});

//guantlet
class Thanos {
  constructor(container, width = 80, height = 80) {
    this._canvas = document.createElement("canvas");
    this._canvas.width = width;
    this._canvas.height = height;
    this._width = width;
    this._height = height;
    this._ctx = this._canvas.getContext("2d");
    this._events = {};

    if (typeof container === "string") {
      container = document.querySelector(container);
    }

    if (container instanceof Node) {
      container.appendChild(this._canvas);
    }

    function createImage(src) {
      const image = new Image();
      image.src = src;

      return image;
    }

    function createAudio(src) {
      const audio = new Audio();
      audio.src = src;

      return audio;
    }

    this._images = {
      idle: createImage("https://e-webdev.ru/example/experiments/thanos-snap/images/thanos-idle@2x.png"),
      snap: createImage("https://e-webdev.ru/example/experiments/thanos-snap/images/thanos-snap@2x.png"),
      reverse: createImage("https://e-webdev.ru/example/experiments/thanos-snap/images/thanos-time@2x.png")
    };

    this._sound = {
      snap: createAudio("https://e-webdev.ru/example/experiments/thanos-snap/sound/thanos_snap_sound.mp3"),
      reverse: createAudio("https://e-webdev.ru/example/experiments/thanos-snap/sound/thanos_reverse_sound.mp3")
    };

    this._canvas.addEventListener("click", () => {
      this.dispatchEvent("click");
    });

    this.idle();
  }

  _getImage(image, cb) {
    if (image.complete) {
      cb(image);
    } else {
      image.addEventListener("load", () => {
        cb(image);
      });
    }
  }

  _getSound(audio, cb) {
    if (audio.readyState === 4) {
      cb(new Audio(audio.src));
    } else {
      audio.addEventListener("canplay", () => {
        cb(new Audio(audio.src));
      }); 
    }
  }

  _playSprite(image, frames) {
    return new Promise(resolve => {
      let frame = 0;
      let delta = 0;
      let interval = 1000 / 24;
      let then = Date.now();

      const animate = () => {
        const now = Date.now();
        delta = now - then;

        if (frame < frames) {
          if (delta > interval) {
            this._ctx.clearRect(0, 0, this._width, this._height);
            this._ctx.drawImage(
              image,
              frame * image.naturalHeight,
              0,
              image.naturalHeight,
              image.naturalHeight,
              0,
              0,
              this._width,
              this._height
            );
            then = now - (delta % interval);
            frame += 1;
          }

          requestAnimationFrame(animate);
        } else {
          resolve();
        }
      };

      animate();
    });
  }

  _playSound(audio) {
    audio.pause();
    audio.currentTime = 0;
    audio.play();
  }

  async _play(image, audio) {
    this._playSound(audio);
    await this._playSprite(image, image.naturalWidth / image.naturalHeight);
  }

  get state() {
    return this._state;
  }

  snapSound() {}

  idle() {
    if (this._state === "preparing") return;

    this._state = "preparing";
    this._getImage(this._images.idle, image => {
      this._ctx.clearRect(0, 0, this._width, this._height);
      this._ctx.drawImage(image, 0, 0, this._width, this._height);
      this._state = "idle";
    });
  }

  snap() {
    if (this._state === "preparing") return;

    this._state = "preparing";

    this._getImage(this._images.snap, image => {
      this._getSound(this._sound.snap, audio => {
        this._play(image, audio).then(() => {
          this._state = "snap";
        });
      });
    });
  }

  reverse() {
    if (this._state === "preparing") return;

    this._state = "preparing";

    this._getImage(this._images.reverse, image => {
      this._getSound(this._sound.reverse, audio => {
        this._play(image, audio).then(() => {
          this._state = "idle";
        });
      });
    });
  }

  dispatchEvent(event) {
    if (Array.isArray(this._events[event])) {
      this._events[event].forEach(cb => {
        cb();
      });
    }
  }

  on(event, cb) {
    if (!Array.isArray(this._events[event])) {
      this._events[event] = [];
    }

    this._events[event].push(cb);
  }
}

const thanos = new Thanos("#guantlet", 160, 160);

thanos.on("click", () => {
  if (thanos.state === "idle") {
    thanos.snap();
  } else if (thanos.state === "snap") {
    thanos.reverse();
  }
});