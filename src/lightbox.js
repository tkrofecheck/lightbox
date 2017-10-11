function Lightbox(url) {
	this.responseJson = null;
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
}

Lightbox.prototype.search = function(value) {
	console.log('select', this);
};

Lightbox.prototype.render = function(searchQuery) {
	if (!searchQuery) {
		console.log('need query to render');
		return;
	}

	var apiUrl =
		'https://www.googleapis.com/customsearch/v1?cx=003855216133477760451%3A4zvjz-bh334&cr=true&imgType=photo&q=' +
		searchQuery +
		'&safe=high&searchType=image&key=AIzaSyAVGFZDgKUNvMMjLi5I4uS0f0ag6ETGHLw';

	this.getData(apiUrl);
};

Lightbox.prototype.ready = function() {
	// Data is ready, continue...
	this.createDOM();
};

Lightbox.prototype.createDOM = function() {
	var gallery = document.getElementById('gallery');
	gallery.innerHTML = this.responseJson;
};
