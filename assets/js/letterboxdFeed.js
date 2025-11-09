var LetterboxdFeed = {
    init: function(config) {
        this.username = config.username;
        this.count = config.count || 10;
        this.corsProxy = config.corsProxy || 'https://api.allorigins.win/raw?url=';
        this.feedUrl = this.corsProxy + encodeURIComponent('https://letterboxd.com/' + this.username + '/rss/');
        this.container = config.container;
        this.onComplete = config.onComplete || function () {};
        this.fetch();
    },

    xmlHttp: function(){
        return new XMLHttpRequest();
    },

    fetchFeed: function(options, callback) {
        var self = this;
        var xhttp = self.xmlHttp();
        options.url = options.url || location.href;
        xhttp.open("GET", options.url, true);
        xhttp.send(null);

        xhttp.onreadystatechange = function () {
            if (xhttp.status === 200 && xhttp.readyState === 4) {
                callback(xhttp.responseText);
            }
        };
    },

    parseRating: function(rating) {
        if (!rating || rating === '') {
            return '';
        }
        var numRating = parseFloat(rating);
        var ratingText = numRating.toString();
        if (numRating === 1) {
            return ratingText + ' Star';
        } else {
            return ratingText + ' Stars';
        }
    },

    parseDate: function(dateString) {
        var date = new Date(dateString);
        var options = { month: 'long', day: 'numeric', year: 'numeric' };
        return date.toLocaleDateString("en-US", options);
    },

    extractImageFromDescription: function(description) {
        var tempDiv = document.createElement('div');
        tempDiv.innerHTML = description;
        var img = tempDiv.querySelector('img');
        return img ? img.src : '';
    },

    bindTemplate: function(film) {
        var container = '';
        container += "<article class='col-6 col-12-xsmall work-item'>";

        if (film.poster) {
            container += "<a href='" + film.link + "' class='image fit thumb'>";
            container += "<img src='" + film.poster + "' alt='" + film.title + "' style='max-height: 150px; object-fit: cover;' />";
            container += "</a>";
        }

        container += "<h3><a href='" + film.link + "'>" + film.title;
        if (film.year) {
            container += " (" + film.year + ")";
        }
        container += "</a></h3>";

        // Combine rating and watched date on the same line
        var metadata = '';
        if (film.rating) {
            metadata += film.rating;
        }
        if (film.watchedDate) {
            if (metadata) {
                metadata += " | ";
            }
            metadata += "Watched: " + film.watchedDate;
        }
        if (metadata) {
            container += "<p>" + metadata + "</p>";
        }

        container += "</article>";
        return container;
    },

    fetch: function() {
        var self = this;

        self.fetchFeed({url: self.feedUrl}, function(response) {
            var parser = new DOMParser();
            var xmlDoc = parser.parseFromString(response, "text/xml");

            var items = xmlDoc.querySelectorAll('item');
            var films = [];
            var content = '';

            for (var i = 0; i < Math.min(items.length, self.count); i++) {
                var item = items[i];

                // Extract film data from custom letterboxd namespace and standard RSS elements
                var filmTitle = item.getElementsByTagNameNS('*', 'filmTitle')[0];
                var filmYear = item.getElementsByTagNameNS('*', 'filmYear')[0];
                var memberRating = item.getElementsByTagNameNS('*', 'memberRating')[0];
                var watchedDate = item.getElementsByTagNameNS('*', 'watchedDate')[0];
                var description = item.querySelector('description');
                var link = item.querySelector('link');

                var film = {
                    title: filmTitle ? filmTitle.textContent : '',
                    year: filmYear ? filmYear.textContent : '',
                    rating: memberRating ? self.parseRating(memberRating.textContent) : '',
                    watchedDate: watchedDate ? self.parseDate(watchedDate.textContent) : '',
                    poster: description ? self.extractImageFromDescription(description.textContent) : '',
                    link: link ? link.textContent : ''
                };

                films.push(film);
            }

            // Generate HTML content
            for (var j = 0; j < films.length; j++) {
                content += self.bindTemplate(films[j]);
            }

            var filmsList = document.querySelector(self.container);
            if (filmsList) {
                filmsList.innerHTML = content;
            }

            self.onComplete();
        });
    }
};
