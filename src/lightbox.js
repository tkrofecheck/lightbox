/* START: Cookie set/get from W3schools */
function Lightbox(cfg) {
	this.config = {
		apiKey: cfg.apiKey || '',
		cachePrefix: cfg.cachePrefix || null,
		containerName: cfg.containerName || 'lb-container',
		create_Dropdown: cfg.create_Dropdown || false,
		create_SearchBox: cfg.create_SearchBox || true,
		customSearchLabel: cfg.customSearchLabel || 'What are you looking for?',
		monitorConnection: cfg.monitorConnection || false,
		presetDropdownJson: cfg.create_Dropdown ? cfg.presetDropdownJson : null,
		searchName: cfg.searchName || 'Image Search'
	};

	this.body = document.getElementsByTagName('body')[0];
	this.gallery = null;
	this.responseJson = null;
	this.photos = [];
	this.cachedData = false;
	this.searchResult = null;
	this.searchQuery = null;

	if (this.config.gallerySelector === null) {
		console.warn('DOM gallery selector required to initialize Lightbox.');
	}

	if (
		this.config.create_Dropdown &&
		!this.config.create_DropdownJson === null
	) {
		console.warn('File path or JSON object expected to create dropdown.');
	}

	// Some browsers do not support console - this will prevent errors
	if (typeof console == 'undefined') {
		this.console = {
			log: function() {},
			warn: function() {},
			error: function() {}
		};
	}
}

Lightbox.prototype.useWebStorage = function() {
	try {
		sessionStorage.setItem('test', 'test');
		sessionStorage.removeItem('test');
		return true;
	} catch (e) {
		console.warn('web storage not supported, data will not be cached');
		return false;
	}
};

Lightbox.prototype.xhrRequest = function(type, url, successHandler) {
	var _this = this,
		useWebStorage = this.useWebStorage(),
		xhr;

	function errorHandler(msg) {
		console.error(msg);
	}

	if (window.XMLHttpRequest) {
		xhr = new XMLHttpRequest();
	} else {
		// code for older browsers
		xhr = new ActiveXObject('Microsoft.XMLHTTP');
	}

	xhr.open('GET', url);
	xhr.responseType = 'json';
	xhr.onreadystatechange = function() {
		if (xhr.readyState === 4) {
			if (xhr.status === 200) {
				successHandler && successHandler(xhr.response);
			}

			if (xhr.status === 403) {
				alert(
					'API Limit reached...\nPlease use a different API key, or try again tomorrow.'
				);
				errorHandler(xhr.status);
			}

			if (xhr.status === 404) {
				console.warn(
					'Request failed to "GET", "' +
						url +
						'".\nReturned status of ' +
						xhr.status
				);

				errorHandler(xhr.status);
			}
		}
	};
	xhr.send();
};

Lightbox.prototype.init = function() {
	this.createContainer();
};

Lightbox.prototype.loading = function(el, display, type) {
	if (display) {
		this.addClass(el, 'load-spinner'); // display loading load-spinner
		this.addClass(el, type);
	} else {
		this.removeClass(el, 'load-spinner'); // display loading load-spinner
		this.removeClass(el, type);
	}
};

Lightbox.prototype.search = function(search) {
	var _this = this,
		useWebStorage = this.useWebStorage(),
		cacheKey,
		url,
		response;

	function successFn(data) {
		_this.responseJson = data;

		if (useWebStorage) {
			sessionStorage.setItem(cacheKey, JSON.stringify(data));
		}

		_this.ready();
	}

	if (search !== '') {
		this.searchQuery = search;

		cacheKey = this.config.cachePrefix + this.searchQuery;

		if (useWebStorage) {
			cachedJsonStr = sessionStorage.getItem(cacheKey) || null;
		}

		if (
			typeof cachedJsonStr !== 'undefined' &&
			cachedJsonStr !== null &&
			cachedJsonStr !== ' '
		) {
			this.cachedData = true;
			this.responseJson = JSON.parse(cachedJsonStr);
			this.ready();
		} else {
			this.cachedData = false;

			url =
				'https://www.googleapis.com/customsearch/v1?cx=003855216133477760451%3A4zvjz-bh334&cr=true&imgType=photo&q=' +
				this.searchQuery +
				'&safe=high&searchType=image&key=' +
				this.config.apiKey;

			this.xhrRequest('GET', url, successFn);
		}
	}
};

Lightbox.prototype.ready = function() {
	// Search data is ready, continue to render gallery...
	this.render_gallery();
};

Lightbox.prototype.render_gallery = function() {
	var _this = this,
		images = this.responseJson.items || null,
		clearStorage = document.querySelector('.clear-storage button'),
		raf =
			window.requestAnimationFrame ||
			window.mozRequestAnimationFrame ||
			window.webkitRequestAnimationFrame ||
			window.msRequestAnimationFrame ||
			window.oRequestAnimationFrame,
		searchResult,
		totalResults,
		searchRequestTitle,
		thumbnails,
		thumb,
		thumbLoaded = function(container) {
			var image = container.querySelector('img');

			if (!image.complete || image.naturalHeight === 0) {
				raf(function() {
					thumbLoaded(container);
				});
				return;
			} else {
				_this.loading(container, false, 'dark');
			}
		},
		createDiv = function(index) {
			var div = document.createElement('div'),
				photo;

			if (index >= 0 && images !== null) {
				_this.addClass(div, 'thumb-container');
				_this.loading(div, true, 'dark');

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

	this.photos = [];
	this.gallery.innerHTML = ''; // clear gallery to display new search

	totalResults = this.cachedData
		? 'Cached search results.'
		: 'About ' +
			this.responseJson.queries.request[0].totalResults +
			' results.';

	this.searchResult = document.querySelector('.search-result');

	if (!_this.searchResult) {
		searchResult = document.createElement('div');
		this.lbContainer.insertBefore(searchResult, this.gallery);
		this.addClass(searchResult, 'search-result');
		this.searchResult = document.querySelector('.search-result');
	}

	searchRequestTitle = this.responseJson.queries.request[0].title;

	this.searchResult.innerHTML =
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

	this.removeClass(clearStorage, 'hide');
	this.addClass(clearStorage.nextSibling, 'hide');

	this.bind_galleryEvents();
};

Lightbox.prototype.render_searchTypes = function() {
	var _this = this,
		searchContainer = this.lbContainer.querySelector('.search'),
		types = document.createElement('div'),
		searchTypes = document.createElement('div');

	function createType(name, isChecked, container) {
		var div = document.createElement('div'),
			input = document.createElement('input'),
			label = document.createElement('label');

		types.appendChild(div);

		input.setAttribute('id', name);
		input.setAttribute('name', 'search-type');
		input.setAttribute('type', 'radio');

		if (isChecked) {
			input.setAttribute('checked', '');
		}

		div.appendChild(input);

		label.setAttribute('for', name);
		label.innerHTML = name;
		div.appendChild(label);

		container.appendChild(div);
	}

	function createSearchType(name, visible) {
		var div = document.createElement('div');

		_this.addClass(div, name);

		if (!visible) {
			_this.addClass(div, 'hide');
		}

		searchTypes.appendChild(div);
	}

	searchContainer.appendChild(types);
	searchContainer.appendChild(searchTypes);

	this.addClass(types, 'types');
	this.addClass(searchTypes, 'search-types');

	if (this.config.create_Dropdown) {
		createType('preset', true, types);
		createSearchType('preset', true);

		if (this.config.presetDropdownJson === null) {
			console.warn('JSON file/object to create dropdown expected.');
			return;
		} else {
			this.createPresetDropdown();
		}
	}

	if (this.config.create_SearchBox) {
		createType('custom', false, types);
		if (this.config.create_Dropdown) {
			createSearchType('custom', false);
		} else {
			createSearchType('custom', true);
		}
		this.createSearchBox();
	}

	if (!this.config.create_Dropdown || !this.config.create_SearchBox) {
		types.style.display = 'none'; // only display toggle if both are present
	}

	this.bind_searchTypeEvents();
};

Lightbox.prototype.createPresetDropdown = function() {
	var _this = this,
		response,
		div,
		dropdown,
		option;

	function createTopic(topic) {
		option = document.createElement('option');
		option.setAttribute('value', '');
		_this.addClass(option, 'category');
		option.innerHTML = topic.name;
		dropdown.appendChild(option);

		for (let i = 0; i < topic.options.length; i++) {
			option = document.createElement('option');
			option.setAttribute(
				'value',
				topic.name
					.toLowerCase()
					.split(' ')
					.join('+') +
					'+' +
					topic.options[i].split(' ').join('+')
			);
			option.innerHTML = topic.options[i];
			dropdown.appendChild(option);
		}
	}

	function createDropdown(data) {
		var presetContainer = document.querySelector('.search-types .preset');

		div = document.createElement('div');
		dropdown = document.createElement('select');
		dropdown.setAttribute('name', 'gallerySelector');

		option = document.createElement('option');
		option.setAttribute('selected', 'selected');
		option.setAttribute('value', '');
		option.innerHTML = 'Select a Topic';
		dropdown.appendChild(option);

		for (let i = 0; i < data.topics.length; i++) {
			createTopic(data.topics[i]);
		}

		presetContainer.appendChild(div);
		div.appendChild(dropdown);

		dropdown.addEventListener('change', function() {
			Gallery.search(this.value);
		});
	}

	if (typeof this.config.presetDropdownJson === 'string') {
		this.xhrRequest('GET', _this.config.presetDropdownJson, createDropdown);
	} else {
		createDropdown(this.config.presetDropdownJson);
	}
};

Lightbox.prototype.createSearchBox = function() {
	var customContainer = document.querySelector('.search-types .custom'),
		div = document.createElement('div'),
		input = document.createElement('input'),
		label = document.createElement('label'),
		button = document.createElement('button');

	this.addClass(div, 'searchBox');

	input.setAttribute('type', 'text');
	input.setAttribute('id', 'mySearch');
	input.setAttribute('autocomplete', 'on');
	input.setAttribute('required', '');

	label.setAttribute('for', 'mySearch');
	label.innerHTML = '<span>' + this.config.customSearchLabel + '</span>';

	button.setAttribute('name', 'search');
	button.innerHTML = 'Search';

	div.appendChild(input);
	div.appendChild(label);
	div.appendChild(button);

	customContainer.appendChild(div);
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

Lightbox.prototype.bind_galleryEvents = function() {
	var _this = this,
		useWebStorage = this.useWebStorage(),
		clearStorage = document.querySelector('.clear-storage button'),
		thumbnails = this.gallery.querySelectorAll(
			'.thumb-container:not(.empty)'
		);

	for (let i = 0; i < thumbnails.length; i++) {
		thumbnails[i].addEventListener('click', function(e) {
			e.stopPropagation();
			_this.loading(this, true, 'light');
			_this.Modal(this, i);
		});
	}

	clearStorage.addEventListener('click', function() {
		var i = sessionStorage.length,
			re = new RegExp(_this.config.cachePrefix),
			refresh;

		while (i--) {
			var key = sessionStorage.key(i);
			if (re.test(key)) {
				if (useWebStorage) {
					sessionStorage.removeItem(key);
				}
			}
		}

		_this.removeClass(clearStorage.nextSibling, 'hide');
	});
};

Lightbox.prototype.bind_searchTypeEvents = function() {
	var _this = this,
		presetBtn,
		customBtn,
		searchTypePreset,
		searchTypeCustom,
		searchBox,
		searchBoxInput,
		searchBoxBtn,
		searchQuery;

	if (this.config.create_Dropdown) {
		presetBtn = document.getElementById('preset');
		searchTypePreset = document.querySelector('.search-types .preset');

		presetBtn.addEventListener('click', function(e) {
			_this.removeClass(searchTypePreset, 'hide');
			_this.addClass(searchTypeCustom, 'hide');
		});
	}

	if (this.config.create_SearchBox) {
		customBtn = document.getElementById('custom');
		searchTypeCustom = document.querySelector('.search-types .custom');

		customBtn.addEventListener('click', function() {
			_this.addClass(searchTypePreset, 'hide');
			_this.removeClass(searchTypeCustom, 'hide');
			searchTypeCustom.querySelector('input[type=text]').focus();
		});

		searchBox = document.querySelector('.searchBox');
		searchBoxInput = searchBox.querySelector('input');
		searchBoxBtn = searchBox.querySelector('button');

		searchBoxInput.addEventListener('keypress', function(e) {
			if (e.keyCode == 13) {
				searchQuery = searchBoxInput.value.split(' ').join('+');
			}

			if (searchQuery) {
				_this.search(searchQuery);
			}
		});

		searchBoxBtn.addEventListener('click', function() {
			searchQuery = searchBoxInput.value.split(' ').join('+');
			_this.search(searchQuery);
		});
	}
};

Lightbox.prototype.Modal = function(thumbEl, index) {
	if (document.querySelector('.modal')) {
		return;
	}

	var _this = this,
		container = this.lbContainer,
		modal = document.createElement('div'),
		raf =
			window.requestAnimationFrame ||
			window.mozRequestAnimationFrame ||
			window.webkitRequestAnimationFrame ||
			window.msRequestAnimationFrame ||
			window.oRequestAnimationFrame;

	function showModal() {
		var photo = modal.querySelector('img');

		if (!photo.complete || photo.naturalHeight === 0) {
			raf(showModal);
			return;
		} else {
			_this.loading(thumbEl, false, 'light');
			_this.addClass(_this.body, 'no-scroll');
			_this.addClass(modal, 'show');
			_this.bind_modalEvents();
		}
	};

	this.addClass(modal, 'modal');
	modal.setAttribute('data-index', index);
	modal.innerHTML =
		'<div class="close"></div>' +
		'<div class="photo-container">' +
		'<img src="' +
		thumbEl.querySelector('img').getAttribute('data-src') +
		'">' +
		'<div class="description">' +
		this.photos[index].description +
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
		loadingDots = 1,
		raf =
			window.requestAnimationFrame ||
			window.mozRequestAnimationFrame ||
			window.webkitRequestAnimationFrame ||
			window.msRequestAnimationFrame ||
			window.oRequestAnimationFrame,
		position;

	function updateImage(i) {
		var loadNextImage = function() {
				_this.addClass(image, 'transparent');

				image.src = _this.photos[i].src;

				if (!image.complete) {
					raf(loadNextImage);
					return;
				} else {
					clearInterval(loadInterval);
					_this.loading(photo, false, 'light');
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

		_this.loading(photo, true, 'light');
		desc.innerHTML = '&#8226; loading &#8226;';
		loadNextImage();
	}

	function close_clickHandler(e) {
		_this.removeClass(_this.body, 'no-scroll');
		modal.remove();
	}

	function leftNav_clickHandler(e) {
		e.stopPropagation();
		position = _this.photos.length - 1;
		index = index === 0 ? position : index - 1;
		updateImage(index);
	}

	function rightNav_clickHandler(e) {
		e.stopPropagation();
		position = _this.photos.length - 1;
		index = index === position ? 0 : index + 1;
		updateImage(index);
	}

	close.addEventListener('click', close_clickHandler);
	leftNav.addEventListener('click', leftNav_clickHandler);
	rightNav.addEventListener('click', rightNav_clickHandler);
	photo.addEventListener('click', rightNav_clickHandler);
	desc.addEventListener('click', function(e) {
		// preventing the next image to load when clicking description
		e.stopPropagation();
	});
};

Lightbox.prototype.createContainer = function() {
	var container = document.createElement('div'),
		html = '';

	html += '<div class="search">';

	if (this.config.monitorConnection) {
		html +=
			'<div class="connection">' +
			'<span class="dot"></span>' +
			'<span class="message"></span>' +
			'</div>';
	}

	html +=
		'<h1>' +
		this.config.searchName +
		'</h1>' +
		'</div>' +
		'<div class="lb-gallery"></div>' +
		'<div class="clear-storage">' +
		'<button class="hide">Clear Search History</button>' +
		'<span class="hide">Search History Cleared!</span>' +
		'</div>' +
		'</div>';

	container.setAttribute('data-name', this.config.containerName);
	this.addClass(container, 'lb-container');
	container.innerHTML = html;

	this.body.appendChild(container);

	this.lbContainer = container;

	this.gallery = container.querySelector('.lb-gallery');

	if (this.config.monitorConnection) {
		this.watch_connectionStatus();
	}

	this.render_searchTypes();
};

Lightbox.prototype.watch_connectionStatus = function() {
	var container = document.querySelector(
			'[data-name="' + this.config.containerName + '"]'
		),
		connection = container.querySelector('.connection'),
		formElements = container.querySelectorAll('input,select,button');

	function connectionStatus() {
		var status = navigator.onLine ? 'online' : 'offline';
		var disabled = status === 'offline';

		connection.className = 'connection ' + status;

		if (status === 'offline') {
			formElements.forEach(function(node) {
				node.setAttribute('disabled', true);
			});
		} else {
			formElements.forEach(function(el) {
				el.removeAttribute('disabled');
			});
		}
	}

	window.addEventListener('load', connectionStatus);
	window.addEventListener('online', connectionStatus);
	window.addEventListener('offline', connectionStatus);
};
