/* START: Cookie set/get from W3schools */
function Lightbox(apiKeys) {
	this.apiKeys = typeof apiKeys === 'string' ? apiKeys.split(',') : apiKeys;
	this.gallery = null;
	this.responseJson = null;
	this.photos = [];
	this.cacheSearchPrefix = 'lbsearch_';
	this.doNotRender = false;
}

Lightbox.prototype.useWebStorage = function() {
	try {
		sessionStorage.setItem('test', 'test');
		sessionStorage.removeItem('test');
		return true;
	} catch (e) {
		console.log('web storage not supported, using cookies instead');
		return false;
	}
};

Lightbox.prototype.setCookie = function(cname, cvalue, exdays) {
	var d = new Date();
	d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
	var expires = 'expires=' + d.toUTCString();
	document.cookie = cname + '=' + cvalue + ';' + expires + ';path=/';
};

Lightbox.prototype.getCookie = function(cname) {
	var name = cname + '=';
	var decodedCookie = decodeURIComponent(document.cookie);
	var ca = decodedCookie.split(';');
	for (var i = 0; i < ca.length; i++) {
		var c = ca[i];
		while (c.charAt(0) === ' ') {
			c = c.substring(1);
		}
		if (c.indexOf(name) === 0) {
			return c.substring(name.length, c.length);
		}
	}
	return '';
};

Lightbox.prototype.getData = function(query) {
	var _this = this,
		cacheKey = _this.cacheSearchPrefix + query,
		useWebStorage = _this.useWebStorage(),
		cachedJsonStr =
			sessionStorage.getItem(cacheKey) ||
			_this.getCookie(cacheKey) ||
			null,
		complete = false,
		xhrSend = function(index) {
			var xhr,
				url =
					'https://www.googleapis.com/customsearch/v1?cx=003855216133477760451%3A4zvjz-bh334&cr=true&imgType=photo&q=' +
					query +
					'&safe=high&searchType=image&key=' +
					_this.apiKeys[index];

			if (window.XMLHttpRequest) {
				xhr = new XMLHttpRequest();
			} else {
				// code for older browsers
				xhr = new ActiveXObject('Microsoft.XMLHTTP');
			}

			xhr.onreadystatechange = function() {
				if (this.readyState === 4) {
					if (this.status === 200) {
						complete = true;

						if (useWebStorage) {
							sessionStorage.setItem(cacheKey, this.responseText);
						} else {
							_this.setCookie(cacheKey, this.responseText, 1);
						}

						_this.responseJson = JSON.parse(this.responseText);
						_this.ready();
					}

					if (this.status === 403) {
						index++;

						if (index < _this.apiKeys.length - 1) {
							xhrSend(index);
						} else {
							complete = true;
							return;
						}
					}
				}
			};

			if (!complete) {
				xhr.open('GET', url, true);
				xhr.send();
			}
		};

	/*
	* Do not make multiple calls due to API limit restriction
	* Access cached response if available in webstorage or cookie
	*/
	if (
		typeof cachedJsonStr !== 'undefined' &&
		cachedJsonStr !== null &&
		cachedJsonStr !== ''
	) {
		_this.responseJson = JSON.parse(cachedJsonStr);
		_this.ready();
	} else {
		xhrSend(0);
	}
};

Lightbox.prototype.init = function(selector) {
	var galleryDiv;

	if (typeof selector === 'undefined' || selector === '') {
		console.log('Selector required to initialize Lightbox.');
		return;
	}

	this.gallery = document.querySelector(selector);

	if (typeof this.gallery === 'undefined' || this.gallery === null) {
		this.doNotRender = true;

		throw Error(
			'DOMelement with selector, "' +
				selector +
				'" missing in your HTML document.'
		);
		return;
	}

	this.addClass(this.gallery, 'lb-gallery');
	this.bindEvents();
};

Lightbox.prototype.galleryLoad = function(display) {
	if (display) {
		_this.addClass(this.gallery, 'load-spinner'); // display loading load-spinner
	} else {
		_this.removeClass(this.gallery, 'load-spinner'); // display loading load-spinner
	}
};

Lightbox.prototype.preset = function(search) {
	if (this.doNotRender) {
		console.log('Cannot search for ' + search + ' at this time');
		return;
	}

	if (search !== '') {
		this.getData(search);
	}
};

Lightbox.prototype.custom = function(search) {
	if (this.doNotRender) {
		console.log('Cannot search for ' + search + ' at this time');
		return;
	}
	
	console.log('search', search);
};

Lightbox.prototype.ready = function() {
	// Data is ready, continue...
	this.render();
};

Lightbox.prototype.render = function() {
	var _this = this,
		images = _this.responseJson.items,
		winWidth = document.documentElement.clientWidth,
		div,
		photo,
		thumbnails,
		thumb;

	function createDiv(index) {
		div = document.createElement('div');

		if (index >= 0) {
			div.setAttribute('class', 'thumb-container');

			photo = document.createElement('img');
			photo.setAttribute('src', images[index].image.thumbnailLink);
			photo.setAttribute('data-src', images[index].link);

			_this.photos.push({
				src: images[index].link,
				description: images[index].title,
				ref: images[index].displayLink
			}); // used later for navigating modal photos

			div.appendChild(photo);
		} else {
			div.setAttribute('class', 'thumb-container empty');
		}

		_this.gallery.appendChild(div);
	}

	_this.gallery.innerHTML = ''; // clear gallery to display new search

	for (let i = 0; i < images.length; i++) {
		createDiv(i);
	}

	/*
	* API returns 10 results
	* Create an addition 2 containers to help with
	* flexbox alignment
	*/
	createDiv();
	createDiv();

	// Bind events for dynamic elements
	thumbnails = _this.gallery.querySelectorAll('.thumb-container:not(.empty)');

	for (let i = 0; i < thumbnails.length; i++) {
		thumbnails[i].addEventListener('click', function(e) {
			e.stopPropagation();
			_this.addClass(this, 'load-spinner');
			_this.Modal(this, i);
		});
	}
};

Lightbox.prototype.hasClass = function(el, className) {
	if (el.classList) {
		return el.classList.contains(className);
	} else {
		return !!el.className.match(
			new RegExp('(\\s|^)' + className + '(\\s|$)')
		);
	}
};

Lightbox.prototype.addClass = function(el, className) {
	if (el.classList) {
		el.classList.add(className);
	} else if (!hasClass(el, className)) {
		el.className += ' ' + className;
	}
};

Lightbox.prototype.removeClass = function(el, className) {
	if (el.classList) {
		el.classList.remove(className);
	} else if (hasClass(el, className)) {
		var reg = new RegExp('(\\s|^)' + className + '(\\s|$)');
		el.className = el.className.replace(reg, ' ');
	}
};

Lightbox.prototype.bindEvents = function() {
	var _this = this,
		useWebStorage = _this.useWebStorage,
		clearStorage,
		customSearch = document.querySelector('[name=customSearch]');

	clearStorage = document.querySelector('.clear-storage');

	clearStorage.addEventListener('click', function() {
		console.log('clear search history');
		var i = sessionStorage.length,
			re = new RegExp(_this.cacheSearchPrefix);

		while (i--) {
			var key = sessionStorage.key(i);
			if (re.test(key)) {
				if (useWebStorage) {
					sessionStorage.removeItem(key);
				} else {
					_this.setCookie(key, -1);
				}
			}
		}
	});

	customSearch.addEventListener('submit', function(e) {
		e.preventDefault(); // stop form from refreshing page on submit
		var search = e.target[0].value; // text input value

		if (search !== '') {
			_this.getData(search);
		}
	});
};

Lightbox.prototype.Modal = function(thumbEl, index) {
	if (document.querySelector('.modal')) {
		return;
	}

	var _this = this,
		container = document.getElementById('container'),
		modal = document.createElement('div'),
		showModal = function() {
			var photo = modal.querySelector('img');

			if (!photo.offsetWidth) {
				window.requestAnimationFrame(showModal);
				return;
			} else {
				_this.removeClass(thumbEl, 'load-spinner');
				_this.addClass(modal, 'show');
				_this.bind_modalEvents();
			}
		};

	_this.addClass(modal, 'modal');
	modal.setAttribute('data-index', index);
	modal.innerHTML =
		'<div class="close"></div>' +
		'<div class="photo-container">' +
		'<img src="' +
		thumbEl.querySelector('img').getAttribute('data-src') +
		'">' +
		'<div class="description"></div>' +
		'</div>' +
		'<div class="nav">' +
		'<span class="left"></span>' +
		'<span class="right"></span>' +
		'</div>';

	container.appendChild(modal);

	showModal();
};

Lightbox.prototype.bind_modalEvents = function() {
	var _this = this,
		modal = document.querySelector('.modal'),
		close = modal.querySelector('.close'),
		leftNav = modal.querySelector('.nav .left'),
		rightNav = modal.querySelector('.nav .right'),
		index = parseInt(modal.getAttribute('data-index')),
		updateImage = function(i) {
			modal.querySelector('img').setAttribute('src', _this.photos[i].src);

			modal.querySelector('.description').innerHTML =
				_this.photos[i].description;
		},
		position;

	leftNav.addEventListener('click', function(e) {
		e.stopPropagation();
		position = _this.photos.length - 1;
		index = index === 0 ? position : index - 1;
		updateImage(index);
	});

	rightNav.addEventListener('click', function(e) {
		e.stopPropagation();
		position = _this.photos.length - 1;
		index = index === position ? 0 : index + 1;
		updateImage(index);
	});

	document.addEventListener('click', function() {
		modal.remove();
	});
};
