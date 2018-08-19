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

    bindTemplate: function(name, description, url, language) {
        var container = '';

        container += "<article class='col-6 col-12-xsmall work-item'>";
        container += "<h3><a href='" + url + "'>" + name + "</a></h3>";
        container += "<p>" + description + "</p>";
        container += "<p><span class='" + language +" language-dot'></span> " + language + "</p>";
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
                content += self.bindTemplate(repos[i].name, repos[i].description, repos[i].svn_url, repos[i].language);
            }

            // content += '</ul>';

            reposList.innerHTML = content;

            self.onComplete();
        });
    }
};
