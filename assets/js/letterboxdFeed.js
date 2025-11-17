var LetterboxdFeed = {
    init: function(config) {
        this.dataUrl = config.dataUrl || 'assets/data/letterboxd.json';
        this.count = config.count || 10;
        this.container = config.container;
        this.onComplete = config.onComplete || function () {};
        this.fetch();
    },

    fetchJSON: function(url, callback) {
        var xhttp = new XMLHttpRequest();
        xhttp.open("GET", url, true);
        xhttp.onreadystatechange = function () {
            if (xhttp.status === 200 && xhttp.readyState === 4) {
                try {
                    var data = JSON.parse(xhttp.responseText);
                    callback(data);
                } catch (e) {
                    console.error('Failed to parse JSON:', e);
                }
            } else if (xhttp.readyState === 4) {
                console.error('Failed to fetch Letterboxd data:', xhttp.status);
            }
        };
        xhttp.send(null);
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

        self.fetchJSON(self.dataUrl, function(films) {
            var content = '';

            // Take only the specified count of films (already sorted by date)
            var displayFilms = films.slice(0, self.count);

            // Generate HTML content
            for (var i = 0; i < displayFilms.length; i++) {
                content += self.bindTemplate(displayFilms[i]);
            }

            var filmsList = document.querySelector(self.container);
            if (filmsList) {
                filmsList.innerHTML = content;
            }

            self.onComplete();
        });
    }
};
