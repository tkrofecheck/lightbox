/* START: Cookie set/get from W3schools */
function Lightbox(url) {
	this.apiKeys = [
		'AIzaSyCfE0Su_1tdA-u36iZIjmNIgSm3XnV56Cc',
		'AIzaSyAVGFZDgKUNvMMjLi5I4uS0f0ag6ETGHLw',
		'AIzaSyCaecX-9H4ptKaqzJm0jx0aRjLKDNEuiG4'
	]; // each key allows 100 search per day
	this.responseJson = null;
	this.photos = [];
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
		useWebStorage = _this.useWebStorage(),
		cachedJsonStr =
			sessionStorage.getItem(query) || _this.getCookie(query) || null,
		xhrSend = function(index) {
			var xhr, url;

			console.log(index);
			if (window.XMLHttpRequest) {
				xhr = new XMLHttpRequest();
			} else {
				// code for older browsers
				xhr = new ActiveXObject('Microsoft.XMLHTTP');
			}

			xhr.onreadystatechange = function() {
				if (this.readyState === 4 && this.status === 200) {
					if (useWebStorage) {
						sessionStorage.setItem(this.responseText);
					} else {
						_this.setCookie(query, this.responseText, 0);
					}

					_this.responseJson = JSON.parse(this.responseText);
					_this.ready();
				} else {
					if ((index === _this.apiKeys.length-1) && this.status === 403) {
						_this.error(
							JSON.parse(this.responseText).error.errors[0]
						);
					} else {
						if (index < _this.apiKeys.length-1) {
							index++;
							xhrSend(index);
						}
					}

					return;
				}
			};

			url =
				'https://www.googleapis.com/customsearch/v1?cx=003855216133477760451%3A4zvjz-bh334&cr=true&imgType=photo&q=' +
				query +
				'&safe=high&searchType=image&key=' +
				_this.apiKeys[index];

			xhr.open('GET', url, true);
			xhr.send();
		};

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

Lightbox.prototype.render = function(searchQuery) {
	if (!searchQuery) {
		console.log('need query to render');
		return;
	}

	this.getData(searchQuery);
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
	var gallery = document.getElementById('gallery'),
		images = this.responseJson.items,
		div,
		photo;

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

	this.bindEvents();
};

Lightbox.prototype.bindEvents = function() {
	var _this = this,
		thumbnails,
		thumb;

	thumbnails = document
		.getElementById('gallery')
		.getElementsByClassName('thumb-container');

	for (let i = 0; i < thumbnails.length; i++) {
		thumbnails[i].addEventListener('click', function(e) {
			e.stopPropagation();
			_this.Modal(this, i);
		});
	}
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
			console.log('showModal', photo);

			if (!photo.offsetWidth) {
				window.requestAnimationFrame(showModal);
				return;
			} else {
				console.log('here');
				modal.className += ' show';
				_this.bind_modalEvents();
			}
		};

	console.log(thumbEl);
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
