/* START: Cookie set/get from W3schools */
function Lightbox(url) {
	this.apiKeys = [
		'AIzaSyCfE0Su_1tdA-u36iZIjmNIgSm3XnV56Cc',
		'AIzaSyAVGFZDgKUNvMMjLi5I4uS0f0ag6ETGHLw',
		'AIzaSyCaecX-9H4ptKaqzJm0jx0aRjLKDNEuiG4'
	]; // each key allows 100 searches per day
	this.responseJson = null;
	this.photos = [];
	this.searchPrefix = 'lbsearch_';
}

Lightbox.prototype.useWebStorage = function() {
	try {
		sessionStorage.setItem('test', 'test');
		sessionStorage.removeItem('test');
		return true;
	} catch (e) {
		console.log('web storage not supported');
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
		cacheKey = _this.searchPrefix + query,
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

Lightbox.prototype.init = function() {
	this.bindEvents();
};

Lightbox.prototype.render = function(searchQuery) {
	if (typeof searchQuery !== 'undefined' && searchQuery !== 'custom') {
		this.getData(searchQuery);
	}

	return;
};

Lightbox.prototype.ready = function() {
	// Data is ready, continue...
	this.createDOM();
};

Lightbox.prototype.error = function(error) {
	var gallery = document.getElementById('gallery');

	gallery.innerHTML =
		'<div class="error">' +
		'<div class="reason">' +
		error.reason +
		'</div>' +
		'<div class="message">' +
		error.message +
		'</div>' +
		'</div>';
};

Lightbox.prototype.createDOM = function() {
	var _this = this,
		gallery = document.getElementById('gallery'),
		images = this.responseJson.items,
		div,
		photo,
		thumbnails,
		thumb;

	gallery.innerHTML = ''; // clear gallery to display new search

	for (let i = 0; i < images.length; i++) {
		div = document.createElement('div');
		photo = document.createElement('img');

		div.setAttribute('class', 'thumb-container');
		photo.setAttribute('src', images[i].image.thumbnailLink);
		photo.setAttribute('data-src', images[i].link);

		this.photos.push({
			src: images[i].link,
			description: images[i].title,
			ref: images[i].displayLink
		}); // used later for navigating modal photos

		div.appendChild(photo);
		gallery.appendChild(div);
	}

	// Bind events for dynamic elements
	thumbnails = gallery.getElementsByClassName('thumb-container');

	for (let i = 0; i < thumbnails.length; i++) {
		thumbnails[i].addEventListener('click', function(e) {
			e.stopPropagation();
			_this.Modal(this, i);
		});
	}
};

Lightbox.prototype.bindEvents = function() {
	var _this = this,
		useWebStorage = _this.useWebStorage,
		clearStorage;

	clearStorage = document.querySelector('.clear-storage');

	clearStorage.addEventListener('click', function() {
		console.log('clear search history');
		var i = sessionStorage.length,
			re = new RegExp(_this.searchPrefix);

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
				modal.className += ' show';
				_this.bind_modalEvents();
			}
		};

	modal.setAttribute('class', 'modal');
	modal.setAttribute('data-index', index);
	modal.innerHTML =
		'<div class="close">&times;</div>' +
		'<div class="photo-container">' +
		'<img src="' +
		thumbEl.querySelector('img').getAttribute('data-src') +
		'">' +
		'<div class="description"></div>' +
		'</div>' +
		'<div class="nav">' +
		'<span class="left">&lt;</span>' +
		'<span class="right">&gt;</span>' +
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
