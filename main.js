var Application = Application || {};

(function (global) {
	var AppartmentModel, AppartmentListItemView, AppartmentsView, AppartmentDetailedView, Appartments;

	AppartmentModel = Backbone.Model.extend({
		defaults: {
			id: 0,
			title: "",
			price: "0.00",
			thumbUrl: "",
			imgUrl: "",
			summary: "",
			bedroomNumber: 0,
			bathroomNumber: 0
		}
	});

	Appartments = Backbone.Collection.extend({
		model: AppartmentModel,
	});

	AppartmentListItemView = Backbone.View.extend({
		model: new AppartmentModel(),
		tagName: 'li',

		initialize: function () {
			this.listenTo(this.model, 'change', this.render);
			this.template = _.template($('#listItem').html());
		},

		events: {
			'click .item__wrapper': 'openMore'
		},

		openMore: function () {
			var detailed = new AppartmentDetailedView({model: this.model});
			detailed.render();
		},

		render: function () {
				this.$el.html(this.template(this.model.toJSON()));
				return this;
		}
	});

	AppartmentsView = Backbone.View.extend({
		model: new Appartments(),
		el: '.wrapper',
		initialize: function () {
			this.template = _.template($('#appartmentList').html());
			this.model.on('change', this.render, this);
		},
		render: function () {
			var that = this;
			this.$el.html(this.template(this.model.toJSON()));
			_.each(this.model.toArray(), function (element, index) {
				that.$('ul').append((new AppartmentListItemView({model: element})).render().$el);
			});
			return this;
		}
	});

	AppartmentDetailedView = Backbone.View.extend({
		model: new AppartmentModel(),
		el: '.wrapper',
		events: {
			"click header a": "back"
		},
		initialize: function () {
			this.template = _.template($('#appartmentMore').html());
		},
		render: function () {
			var rendered = this.template(this.model.toJSON());
			this.$el.html(rendered);

		},
		back: function () {
			Application.appartments = new AppartmentsView({model: Application.appartmentsContainer});
			Application.appartments.render();
		}
	});

	Application.appartmentsContainer = new Appartments();

	var query = $.param({
		country: 'uk',
		pretty: 1,
		action: 'search_listings',
		encoding: 'json',
		listing_type: 'buy',
		page: 1,
		place_name: 'leeds'
	});

	$.ajax({
		url: 'http://api.nestoria.co.uk/api',
		data: query,
		dataType: 'jsonp',
		success: function (data, status, xhr) {
			var listings;
			listings = data.response.listings;
			_.each(listings, function (element, index) {
				Application.appartmentsContainer.add(new AppartmentModel({
					id: index,
					title: element.title,
					price: element.price_formatted,
					thumbUrl: element.thumb_url,
					imgUrl: element.img_url,
					summary: element.summary,
					bedroomNumber: element.bedroom_number,
					bathroomNumber: element.bathroomNumber
				}));
			});

			Application.appartments = new AppartmentsView({model: Application.appartmentsContainer});
			Application.appartments.render();
		}
	});

})(this);