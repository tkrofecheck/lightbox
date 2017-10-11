function getData(url) {
	var xhr;
	if (window.XMLHttpRequest) {
		xhr = new XMLHttpRequest();
	} else {
		// code for older browsers
		xmlhttp = new ActiveXObject('Microsoft.XMLHTTP');
	}
	xhr.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			console.log(this.responseText);
		}
	};
	xhr.open('GET', url, true);
	xhr.send();
}

function Lightbox(url) {
	this.apiUrl = url;
}

Lightbox.prototype.init = function() {
	getData(this.apiUrl);
};

var Gallery = new Lightbox(
	'https://www.googleapis.com/customsearch/v1?cx=003855216133477760451%3A4zvjz-bh334&cr=true&imgType=photo&q=cars&safe=high&searchType=image&key=AIzaSyAVGFZDgKUNvMMjLi5I4uS0f0ag6ETGHLw'
);
Gallery.init();
