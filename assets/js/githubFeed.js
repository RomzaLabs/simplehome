var GithubFeed = {
    init: function(config) {
        this.count = config.count || 0;
        this.order = config.order || 'desc';
        this.url = 'https://api.github.com/users/'+config.username +'/repos?per_page='+ this.count +'&sort=updated&direction='+ this.order;
        this.container = config.container;
        this.onComplete = config.onComplete || function () {};
        this.fetch();
    },

    xmlHttp: function(){
        return new XMLHttpRequest();
    },

    objJSON: function(options, callback) {
        var self = this;

        var xhttp = self.xmlHttp();
        options.url = options.url || location.href;
        xhttp.open("GET", options.url, true);
        xhttp.send( null );

        xhttp.onreadystatechange = function () {
            if (xhttp.status === 200 && xhttp.readyState === 4) {
                callback(xhttp.responseText);
            }
        };
    },

    bindTemplate: function(name, description, url, language, updated_at) {
        var container = '';
        var lcLanguage = language.toLowerCase();
        var date = new Date(updated_at);
        var options = { month: 'long', day: 'numeric', year: 'numeric' };
        var formattedDate = date.toLocaleDateString("en-US", options);


        container += "<article class='col-6 col-12-xsmall work-item'>";
        container += "<h3><a href='" + url + "'>" + name + "</a></h3>";
        container += "<p>" + description + "</p>";
        container += "<p><span class='" + lcLanguage +"-dot language-dot'></span> "
            + "<span class='" + lcLanguage + "-label'>" + language + "</span> "
            + "| Last Updated: " + formattedDate +" </p>";
        container += "</article>";

        return container;
    },

    fetch: function() {
        var self = this;

        self.objJSON({url: self.url}, function(response) {
            var repos     = JSON.parse(response),
                reposList = document.querySelector(self.container),
                content = '',
                i;

            for(i = 0; i < repos.length; i++) {
                content += self.bindTemplate(
                    repos[i].name,
                    repos[i].description,
                    repos[i].svn_url,
                    repos[i].language,
                    repos[i].updated_at
                );
            }

            // content += '</ul>';

            reposList.innerHTML = content;

            self.onComplete();
        });
    }
};
