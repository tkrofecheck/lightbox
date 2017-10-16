/* START: Cookie set/get from W3schools */
function Lightbox(config) {
	this.apiKeys =
		typeof config.apiKeys === 'string'
			? config.apiKeys.split(',')
			: config.apiKeys;
	this.body = document.getElementsByTagName('body')[0];
	this.gallerySelector = config.gallerySelector || null;
	this.gallery = null;
	this.responseJson = null;
	this.photos = [];
	this.cachedData = false;
	this.searchResult = null;
	this.searchQuery = null;
	this.cacheSearchPrefix = config.cacheSearchPrefix || null; // null = off

	if (this.gallerySelector === null) {
		console.warn('DOM selector required to initialize Lightbox.');
	}
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

Lightbox.prototype.getData = function() {
	var _this = this,
		query = _this.searchQuery,
		cacheKey = _this.cacheSearchPrefix + query,
		useWebStorage = _this.useWebStorage(),
		cachedJsonStr,
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

						_this.responseJson = JSON.parse(this.responseText);

						// use later after we get pages setup
						//cacheKey = cacheKey + _this.responseJson.queries.request[0].startIndex;

						if (useWebStorage) {
							sessionStorage.setItem(cacheKey, this.responseText);
						} else {
							_this.setCookie(cacheKey, this.responseText, 1);
						}

						_this.responseJson = JSON.parse(this.responseText);
						_this.ready();
						return;
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
	if (complete) {
		return;
	}

	cachedJsonStr =
		sessionStorage.getItem(cacheKey) || _this.getCookie(cacheKey) || null;

	if (
		typeof cachedJsonStr !== 'undefined' &&
		cachedJsonStr !== null &&
		cachedJsonStr !== ' '
	) {
		_this.cachedData = true;
		_this.responseJson = JSON.parse(cachedJsonStr);
		_this.ready();
	} else {
		_this.cachedData = false;
		xhrSend(0);
	}
};

Lightbox.prototype.init = function() {
	this.gallery = document.querySelector(this.gallerySelector);

	if (typeof this.gallery === 'undefined' || this.gallery === null) {
		throw Error(
			'HTML_DOMelement with selector, "' +
				this.gallerySelector +
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

Lightbox.prototype.search = function(search) {
	if (search !== '') {
		this.searchQuery = search;
		this.getData();
	}
};

Lightbox.prototype.ready = function() {
	// Data is ready, continue...
	this.render();
};

Lightbox.prototype.render = function() {
	var _this = this,
		images = _this.responseJson.items,
		clearStorage = document.querySelector('.clear-storage button'),
		searchResult,
		totalResults,
		searchRequestTitle,
		thumbnails,
		thumb,
		thumbLoaded = function(container) {
			var image = container.querySelector('img');

			if (!image.complete || image.naturalHeight === 0) {
				window.requestAnimationFrame(function() {
					thumbLoaded(container);
				});
				return;
			} else {
				_this.removeClass(container, 'load-spinner');
				_this.removeClass(container, 'dark');
			}
		},
		createDiv = function(index) {
			var div = document.createElement('div'),
				photo;

			if (index >= 0) {
				_this.addClass(div, 'thumb-container');
				_this.addClass(div, 'load-spinner');
				_this.addClass(div, 'dark');

				photo = document.createElement('img');
				photo.setAttribute('src', images[index].image.thumbnailLink);
				photo.setAttribute('data-src', images[index].link);

				div.appendChild(photo);
				_this.gallery.appendChild(div);
				thumbLoaded(div);

				_this.photos.push({
					src: images[index].link,
					description: images[index].title,
					ref: images[index].displayLink
				}); // used later for navigating modal photos
			} else {
				_this.addClass(div, 'thumb-container');
				_this.addClass(div, 'empty');
				_this.gallery.appendChild(div);
			}
		};

	_this.photos = [];
	_this.gallery.innerHTML = ''; // clear gallery to display new search

	totalResults = _this.cachedData
		? 'Cached search results.'
		: 'About ' +
			_this.responseJson.queries.request[0].totalResults +
			' results.';

	_this.searchResult = document.querySelector('.search-result');

	if (!_this.searchResult) {
		searchResult = document.createElement('div');
		_this.gallery.prepend(searchResult);
		_this.addClass(searchResult, 'search-result');
		_this.searchResult = document.querySelector('.search-result');
	}

	searchRequestTitle = _this.responseJson.queries.request[0].title;

	_this.searchResult.innerHTML =
		'<span class="total">' +
		totalResults +
		'</span><span class="title">' +
		searchRequestTitle +
		'</span>';

	for (let i = 0; i < images.length; i++) {
		createDiv(i);
	}

	/*
	* API returns 10 results
	* Create an addition 2 containers to help with
	* flexbox alignment
	*/
	createDiv(-1);
	createDiv(-1);

	// Bind events for dynamic elements
	thumbnails = _this.gallery.querySelectorAll('.thumb-container:not(.empty)');

	for (let i = 0; i < thumbnails.length; i++) {
		thumbnails[i].addEventListener('click', function(e) {
			e.stopPropagation();
			_this.addClass(this, 'load-spinner');
			_this.addClass(this, 'light');
			_this.Modal(this, i);
		});
	}

	_this.removeClass(clearStorage, 'hide');
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
		clearStorage = document.querySelector('.clear-storage button'),
		presetBtn = document.getElementById('preset'),
		customBtn = document.getElementById('custom'),
		searchTypePreset = document.querySelector('.search-type .preset'),
		searchTypeCustom = document.querySelector('.search-type .custom');

	clearStorage.addEventListener('click', function() {
		var i = sessionStorage.length,
			re = new RegExp(_this.cacheSearchPrefix),
			refresh;

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

		refresh = confirm('Refresh most recent search results?');

		if (refresh) {
			_this.getData(_this.searchQuery);
		}
	});

	presetBtn.addEventListener('click', function(e) {
		_this.removeClass(searchTypePreset, 'hide');
		_this.addClass(searchTypeCustom, 'hide');
	});

	customBtn.addEventListener('click', function() {
		_this.addClass(searchTypePreset, 'hide');
		_this.removeClass(searchTypeCustom, 'hide');
		searchTypeCustom.querySelector('input[type=text]').focus();
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

			if (!photo.complete || photo.naturalHeight === 0) {
				window.requestAnimationFrame(showModal);
				return;
			} else {
				_this.removeClass(thumbEl, 'load-spinner');
				_this.removeClass(thumbEl, 'light');
				_this.addClass(_this.body, 'no-scroll');
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
		'<div class="description">' +
		_this.photos[index].description +
		'</div>' +
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
		photo = modal.querySelector('.photo-container'),
		image = modal.querySelector('img'),
		desc = modal.querySelector('.description'),
		index = parseInt(modal.getAttribute('data-index')),
		loadingDots,
		updateImage = function(i) {
			loadingDots = 1;

			var fadeNextImage = function() {
					_this.addClass(image, 'transparent');

					image.setAttribute('src', _this.photos[i].src);

					if (!image.complete || image.naturalHeight === 0) {
						window.requestAnimationFrame(fadeNextImage);
						return;
					} else {
						clearInterval(loadInterval);
						_this.removeClass(photo, 'load-spinner');
						_this.removeClass(photo, 'light');
						_this.removeClass(image, 'transparent');
						desc.innerHTML = _this.photos[i].description;
					}
				},
				loadInterval = setInterval(function(i) {
					if (loadingDots < 5) {
						loadingDots++;
						desc.innerHTML =
							'&#8226; ' + desc.innerHTML + ' &#8226;';
					} else {
						loadingDots = 1;
						desc.innerHTML = '&#8226; loading &#8226;';
					}
				}, 1000);

			_this.addClass(photo, 'load-spinner');
			_this.addClass(photo, 'light');
			desc.innerHTML = '&#8226; loading &#8226;';
			fadeNextImage();
		},
		close_clickHandler = function(e) {
			_this.removeClass(_this.body, 'no-scroll');
			modal.remove();
		},
		leftNav_clickHandler = function(e) {
			e.stopPropagation();
			position = _this.photos.length - 1;
			index = index === 0 ? position : index - 1;
			updateImage(index);
		},
		rightNav_clickHandler = function(e) {
			e.stopPropagation();
			position = _this.photos.length - 1;
			index = index === position ? 0 : index + 1;
			updateImage(index);
		},
		position;

	close.addEventListener('click', close_clickHandler);
	leftNav.addEventListener('click', leftNav_clickHandler);
	rightNav.addEventListener('click', rightNav_clickHandler);
	photo.addEventListener('click', rightNav_clickHandler);
	desc.addEventListener('click', function(e) {
		// preventing the next image to load when clicking description
		e.stopPropagation();
	});
};
