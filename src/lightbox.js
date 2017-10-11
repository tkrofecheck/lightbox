function Lightbox(url) {
	this.responseJson = null;
	this.photos = [];
}

Lightbox.prototype.getData = function(url) {
	var _this = this,
		xhr;

	if (window.XMLHttpRequest) {
		xhr = new XMLHttpRequest();
	} else {
		// code for older browsers
		xmlhttp = new ActiveXObject('Microsoft.XMLHTTP');
	}

	xhr.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			_this.responseJson = JSON.parse(this.responseText);
			_this.ready();
		}
	};

	xhr.open('GET', url, true);
	xhr.send();
};

Lightbox.prototype.search = function(value) {
	console.log('select', this);
};

Lightbox.prototype.render = function(searchQuery) {
	if (!searchQuery) {
		console.log('need query to render');
		return;
	}

	var apiUrl =
		'https://www.googleapis.com/customsearch/v1?cx=003855216133477760451%3A4zvjz-bh334&cr=true&imgType=photo' +
		'&q=' +
		searchQuery +
		'&safe=high&searchType=image&key=AIzaSyAVGFZDgKUNvMMjLi5I4uS0f0ag6ETGHLw';

	this.getData(apiUrl);
};

Lightbox.prototype.ready = function() {
	// Data is ready, continue...
	this.createDOM();
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
			_this.Modal(this);
		});
	}
};

Lightbox.prototype.Modal = function(thumbEl) {
	var container = document.getElementById('container'),
		modal = document.createElement('div');

	console.log(thumbEl);
	modal.setAttribute('class', 'modal');
	modal.innerHTML =
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
	this.bind_modalEvents();
};

Lightbox.prototype.bind_modalEvents = function() {
	var modal = document.querySelector('.modal');

	console.log('modal', modal);
};
