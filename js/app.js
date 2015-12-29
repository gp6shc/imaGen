// JSLint
/*global
	img_gen_vars
*/
/*jslint latedef:nofunc*/

var acceptedTypes = {
  'image/png': true,
  'image/jpeg': true,
  'image/gif': true
};
var container = document.getElementById('IG-wrapper').getBoundingClientRect();
var wrapper = document.getElementById('IG-canvas-wrap');

var imageLoader = document.getElementById('IG-imageLoader');
		imageLoader.addEventListener('change', addImageToCanvas, false);
		
var canvas = document.getElementById('IG-imageCanvas');
canvas.addEventListener('click', function() {
	if ( wrapper.classList.contains('IG-empty') ) {
		imageLoader.click();
	}
}, false);

var closeBtn = document.getElementById('IG-close-btn');
		closeBtn.addEventListener('click', closeModal, false);

var exportBtn = document.getElementById('IG-export');
		exportBtn.addEventListener('click', exportImage, false);
		exportBtn.disabled = true;

var clearBtn = document.getElementById('IG-clear-btn');
		clearBtn.addEventListener('click', clearCanvas, false);
		clearBtn.disabled = true;

var images = document.querySelectorAll('.IG-add-ons img');
for (var i = 0; i < images.length; i++) {
	images[i].addEventListener('mousedown', addImageToCanvas, false);
	images[i].addEventListener('touchstart', addImageToCanvas, false);
}
var readOnlyURL = document.querySelector('.LB-url');
		readOnlyURL.addEventListener('click', function() {
			this.select();
		}, false);

var imgFrame = new Image();
var bannerReady = false;
imgFrame.src = window.location.origin + '/wp-content/plugins/imaGen/img/Germ_E-Card_Frame.png';
imgFrame.onload = function() {
	bannerReady = true;
};


var finalImg = {
	'name': '',
	'src': '',
	'date': ''
};
		
function canvasInit() {
	canvas.width = container.width * 0.75; // width - (banner width x 2); banner width = 12.5% of total width; =>  width should be 75% of container
	canvas.height = canvas.width * (2/3) + 1; // height = 2/3 the width to match the inside aspect ratio of the frame
}
canvasInit();

function clearCanvas() {
	var additions = wrapper.children;
	
	if (additions.length > 2) {
		while (additions.length > 2) {
			wrapper.removeChild(additions[2]);
		}
		exportBtn.disabled = true;
		clearBtn.innerHTML = "Clear Image";

	}else{
		// clear and reset the canvas
		wrapper.removeChild(additions[1]);
		clearBtn.disabled = true;
		clearBtn.innerHTML = "Clear";
		exportBtn.disabled = true;
		
		toggleFileInput();
	}
}

function addImageToCanvas(file) {
	var DOM_img = document.createElement("img");
	if (file && acceptedTypes[file.type]) {
		wrapper.classList.add('IG-loading');
		var reader = new FileReader();
    reader.onload = function (event) {
	    DOM_img.classList.add('IG-bg');
			DOM_img.src = event.target.result;
    };
		reader.readAsDataURL(file);
	}else if (this.src !== "") {
		if ( !wrapper.classList.contains('IG-empty') ) {
			DOM_img.src = this.src;
		}else{
			return;
		}
	}else if (file.target) {
		wrapper.classList.add('IG-loading');
		var reader = new FileReader();
		reader.onload = function(event){
			DOM_img.classList.add('IG-bg');
			DOM_img.src = event.target.result;
		};
		reader.readAsDataURL(file.target.files[0]);
	}else{
		return;
	}
	
	DOM_img.draggable = false;
	DOM_img.classList.add('IG-movable');
	addListeners(DOM_img);
	wrapper.appendChild(DOM_img);
	wrapper.classList.remove('IG-loading');
	
	exportBtn.disabled = false;
	if ( clearBtn.innerHTML === "Clear") {
		clearBtn.innerHTML = "Clear Image";
	}else{
		clearBtn.innerHTML = "Clear Additions";
	}
	clearBtn.disabled = false;
	
	if (wrapper.classList.contains('IG-empty')) {
		toggleFileInput();
  }
}


// Listeners for image add-ons for mouse and touch interaction
function addListeners(item) {
	var x_pos = 0, y_pos = 0;
	
	item.addEventListener('mousedown', mouseDown, false);
	item.addEventListener('touchstart', touchDown, false);
  window.addEventListener('mouseup', up, false);
  window.addEventListener('touchend', up, false);
  
	function up() {
	  window.removeEventListener('mousemove', mouseMove, false);
	  window.removeEventListener('touchmove', touchMove, false);
	}
  
	function mouseDown(e) {
		e.preventDefault();
	  x_pos = e.clientX - item.offsetLeft;
	  y_pos = e.clientY - item.offsetTop;
	  window.addEventListener('mousemove', mouseMove, false);
	}
	
	function touchDown(e) {
		e.preventDefault();
	  x_pos = e.touches[0].clientX - item.offsetLeft;
	  y_pos = e.touches[0].clientY - item.offsetTop;
	  window.addEventListener('touchmove', touchMove, false);
	}

	function mouseMove(e) {
		e.preventDefault();
		if ( (e.clientY - y_pos) < (canvas.height - (item.height / 2)) && (e.clientY - y_pos) > (0 - (item.height / 2)) ) {
			item.style.top = (e.clientY - y_pos) + 'px';
		}
		if ( (e.clientX - x_pos) < (canvas.width - (item.width / 2)) && (e.clientX - x_pos) > (0 - (item.width / 2)) ) {
			item.style.left = (e.clientX - x_pos) + 'px';
		}
	}
	
	function touchMove(e) {
		e.preventDefault();
		if ( (e.touches[0].clientY - y_pos) < (canvas.height - (item.height / 2)) && (e.touches[0].clientY - y_pos) > (0 - (item.height / 2)) ) {
			item.style.top = (e.touches[0].clientY - y_pos) + 'px';
		}
		if ( (e.touches[0].clientX - x_pos) < (canvas.width - (item.width / 2)) && (e.touches[0].clientX - x_pos) > (0 - (item.width / 2)) ) {
			item.style.left = (e.touches[0].clientX - x_pos) + 'px';
		}
	}
}

function resizeImage(base64, maxWidth, maxHeight) {

  // Max size for thumbnail
  if(typeof(maxWidth) === 'undefined') {
		maxWidth = 500;
  }
  if(typeof(maxHeight) === 'undefined') {
  	maxHeight = 500;
  }

  // Create and initialize two canvas
  var canvas = document.createElement("canvas");
  var ctx = canvas.getContext("2d");
  var canvasCopy = document.createElement("canvas");
  var copyContext = canvasCopy.getContext("2d");

  // Create original image
  var img = new Image();
  img.src = base64;

  // Determine new ratio based on max size
  var ratio = 1;
  if(img.width > maxWidth && img.height > maxHeight) {
    var ratioX = maxWidth / img.width;
    var ratioY = maxHeight / img.height;
		if (ratioX < ratioY) {
			ratio = ratioX;
		}else{
			ratio = ratioY;
		}
  }else if(img.width > maxWidth) {
    ratio = maxWidth / img.width;
  }else if(img.height > maxHeight) {
    ratio = maxHeight / img.height;
  }

  // Draw original image in second canvas
  canvasCopy.width = img.width;
  canvasCopy.height = img.height;
  copyContext.drawImage(img, 0, 0);

  // Copy and resize second canvas to first canvas
  canvas.width = img.width * ratio;
  canvas.height = img.height * ratio;
  ctx.drawImage(canvasCopy, 0, 0, canvasCopy.width, canvasCopy.height, 0, 0, canvas.width, canvas.height);

  return canvas.toDataURL();
}

// Places moveable images onto the actual canvas, deletes removeable images
function exportImage() {
	wrapper.classList.add('IG-loading');
	wrapper.classList.remove('IG-error');
	exportBtn.disabled = true;
	
	var additions = wrapper.children;
	var canvasCopy = document.createElement("canvas");
	var copyContext = canvasCopy.getContext("2d");
	canvasCopy.width = canvas.width * (4/3);
	canvasCopy.height = canvas.height * (1.433);
	
	var x = canvasCopy.width * 0.125;
	var y = canvasCopy.height * 0.125 + 10;
		
	var img = new Image();
	img.src = resizeImage(additions[1].src, 10000, (canvas.height + 20));
	img.onload = function() {
		var style = window.getComputedStyle(additions[1]);
		var bgX = parseFloat(style.getPropertyValue('left'));
		var bgY = parseFloat(style.getPropertyValue('top'));
		copyContext.drawImage(img, (bgX + x), (bgY + y));

		for (var i = additions.length; i > 2; i--) {
			var item = additions[i-1];
			var imgStyle = window.getComputedStyle(item);
			var imgX = parseFloat(imgStyle.getPropertyValue('left'));
			var imgY = parseFloat(imgStyle.getPropertyValue('top'));
			copyContext.drawImage(item, (imgX + x), (imgY + y));
		}
		
		copyContext.drawImage(imgFrame,1,0, canvasCopy.width, canvasCopy.height );
		makeImg(canvasCopy);
	};

}

// Generates an image from the canvas and displays modal with the image element
function makeImg(exportCanvas) {
	finalImg.date = Date.now();
	var name = 'imagen_' + finalImg.date + '.png';
	finalImg.name = name;
	var imgURI = exportCanvas.toDataURL("image/png");
	finalImg.src = imgURI;
	
	sendPost();

	var destination = document.getElementById('IG-img-dest');
	var DOM_img = document.createElement("img");
			DOM_img.src = imgURI;
			DOM_img.className = 'downloadIMG';	
	
	destination.insertBefore(DOM_img, destination.lastElementChild);
	downloadURI(DOM_img.src, name);
	
	
	// Social Buttons
	var sharables = document.querySelectorAll(".IG-LB");
	for (var i = 0; i < sharables.length; i++) {
		sharables[i].href = createSocialLink(finalImg.date, sharables[i].dataset.service);
	}
}

// Generates a link element with the supplied url and name
function downloadURI(url, name) {
  var link = document.querySelector('.IG-download');
  link.download = name;
  link.href = url;
}

// Empties the modal of the generated image and link, shows file input, and clears the canvas
function closeModal() {
	// modal cleanup
	var modal = document.querySelector('.IG-modal-bg');
	setTimeout(function() {
			var dlImg = modal.querySelector('img');
			dlImg.parentElement.removeChild(dlImg);		
		}, 350);

	wrapper.classList.remove('IG-loading');
	exportBtn.disabled = false;
	// hides the modal
	modal.classList.remove('IG-visible');
}

function toggleFileInput() {
	document.getElementById('IG-file-input').classList.toggle('IG-hidden');
	wrapper.classList.toggle('IG-empty');
}


// Drag Events //

document.ondragenter = function(e) {
	e.stopPropagation();
  e.preventDefault();
  var dt = e.dataTransfer;
  dt.effectAllowed = dt.dropEffect = 'none';
};
document.ondragover = function(e) {
  e.stopPropagation();
  e.preventDefault();
  var dt = e.dataTransfer;
  dt.effectAllowed = dt.dropEffect = 'none';
};


canvas.ondragenter = function() {
	wrapper.classList.add('IG-hover');
  return false;
};
canvas.ondragover = function(e) {
  e.stopPropagation();
  e.preventDefault();
  return false;
};
canvas.ondragleave = function() {
	wrapper.classList.remove('IG-hover');
  return false;
};
canvas.ondrop = function(e) {
  e.preventDefault();

	addImageToCanvas(e.dataTransfer.files[0]);
	
	wrapper.classList.remove('IG-hover');
	clearBtn.disabled = false;
	
  return false;
};




// AJAX - jQuery dependent (for now...)
/*

function sendPost() {
	jQuery.ajax({
		type: "post",
		url: "/wp-admin/admin-ajax.php",
		data: { 
			action: 'make_post',
			title: finalImg.date,
			name: finalImg.date,
			img: finalImg.src,
			img_name: finalImg.name,
			_ajax_nonce: img_gen_vars.wpNonce
		},
		beforeSend: function() {},
		success: function() { document.querySelector('.IG-modal-bg').classList.add('IG-visible'); },
		error: function() { wrapper.classList.add('IG-error'); }
	});
}
*/

function sendPost() {
	var xhr = new XMLHttpRequest();
	xhr.open('POST', '/wp-admin/admin-ajax.php', true);
	xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');

	var data = { 
		"action": 'make_post',
		"title": finalImg.date,
		"name": finalImg.date,
		"img": finalImg.src,
		"img_name": finalImg.name,
		"_ajax_nonce": img_gen_vars.wpNonce
	};
	
	xhr.onreadystatechange = function() {
		// Handle error
		if(xhr.status !== 200) {
			wrapper.classList.add('IG-error');
		}
		
		// Everything is fine and we get response
		if(xhr.readyState === 4) {
			document.querySelector('.IG-modal-bg').classList.add('IG-visible');
		}
	};
	var str = Object.keys(data).map(function(key){ 
  	return encodeURIComponent(key) + '=' + encodeURIComponent(data[key]); 
	}).join('&');
	xhr.send( str );
}

function createSocialLink(date, service) {
	var url = window.location.origin + "/img-gen/" + date;
	var apiUrl = '';
	switch(service) {
		case 'facebook':
			apiUrl = 'https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(url);
			return apiUrl;
		case 'twitter':
			apiUrl = 'https://twitter.com/intent/tweet?url=' + encodeURIComponent(url);
			return apiUrl;
		case 'pinterest':
			var d = new Date();
			apiUrl = 'http://pinterest.com/pin/create/button/?url=' + encodeURIComponent(url) + '&media=' + encodeURIComponent("http://momsagainstcooties.com/wp-content/uploads/" + d.getFullYear() + '/' + (d.getMonth() + 1) + '/imagen_' + date + '.png') + '&description=' + encodeURIComponent('Sneezes Greetings Customizable Holiday E-Card') ;
			return apiUrl;
		case 'mail':
			apiUrl = 'mailto:?subject=MomsAgainstCooties%20Holiday%20E-card&body='+ encodeURIComponent(url);
			return apiUrl;
	}
	document.getElementById('IG-LB-url-to-select').value = url;
}
