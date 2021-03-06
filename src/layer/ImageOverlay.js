/*
 * F.Leaflet.ImageOverlay is used to overlay images over the map (to specific geographical bounds).
 */

F.Leaflet.ImageOverlay = F.Leaflet.Layer.extend({

	options: {
		opacity: 1,
		alt: ''
	},

	initialize: function (url, bounds, options) { // (String, LatLngBounds, Object)
		this._url = url;
		this._bounds = F.Leaflet.latLngBounds(bounds);

		F.setOptions(this, options);
	},

	onAdd: function () {
		if (!this._image) {
			this._initImage();

			if (this.options.opacity < 1) {
				this._updateOpacity();
			}
		}

		this.getPane().appendChild(this._image);

		this._reset();
	},

	onRemove: function () {
		F.DomUtil.remove(this._image);
	},

	setOpacity: function (opacity) {
		this.options.opacity = opacity;

		if (this._image) {
			this._updateOpacity();
		}
		return this;
	},

	bringToFront: function () {
		if (this._map) {
			F.DomUtil.toFront(this._image);
		}
		return this;
	},

	bringToBack: function () {
		if (this._map) {
			F.DomUtil.toBack(this._image);
		}
		return this;
	},

	setUrl: function (url) {
		this._url = url;

		if (this._image) {
			this._image.src = url;
		}
		return this;
	},

	getAttribution: function () {
		return this.options.attribution;
	},

	getEvents: function () {
		var events = {
			viewreset: this._reset
		};

		if (this._zoomAnimated) {
			events.zoomanim = this._animateZoom;
		}

		return events;
	},

	_initImage: function () {
		var img = this._image = F.DomUtil.create('img',
				'image-layer ' + (this._zoomAnimated ? 'zoom-animated' : ''));

		img.onselectstart = F.Util.falseFn;
		img.onmousemove = F.Util.falseFn;

		img.onload = F.bind(this.fire, this, 'load');
		img.src = this._url;
		img.alt = this.options.alt;
	},

	_animateZoom: function (e) {
		var topLeft = this._map._latLngToNewLayerPoint(this._bounds.getNorthWest(), e.zoom, e.center),
		    size = this._map._latLngToNewLayerPoint(this._bounds.getSouthEast(), e.zoom, e.center).subtract(topLeft),
		    offset = topLeft.add(size._multiplyBy((1 - 1 / e.scale) / 2));

		F.DomUtil.setTransform(this._image, offset, e.scale);
	},

	_reset: function () {
		var image = this._image,
		    bounds = new F.Leaflet.Bounds(
		        this._map.latLngToLayerPoint(this._bounds.getNorthWest()),
		        this._map.latLngToLayerPoint(this._bounds.getSouthEast())),
		    size = bounds.getSize();

		F.DomUtil.setPosition(image, bounds.min);

		image.style.width  = size.x + 'px';
		image.style.height = size.y + 'px';
	},

	_updateOpacity: function () {
		F.DomUtil.setOpacity(this._image, this.options.opacity);
	}
});

F.Leaflet.imageOverlay = function (url, bounds, options) {
	return new F.Leaflet.ImageOverlay(url, bounds, options);
};
