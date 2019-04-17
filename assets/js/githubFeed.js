var GithubFeed = {
    init: function(config) {
        this.count = config.count || 0;
        this.order = config.order || 'desc';
        this.user_url = 'https://api.github.com/users/'
            + config.username
            + '/repos?per_page='
            + this.count
            + '&sort=pushed&direction='
            + this.order;
        this.org_url = 'https://api.github.com/orgs/'
            + config.orgname
            + '/repos?per_page='
            + this.count
            + '&sort=pushed&direction='
            + this.order;
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

    bindTemplate: function(name, description, svn_url, language, updated_at) {
        var container = '';
        var lcLanguage = '';
        if (language !== null && language !== '') {
            lcLanguage = language.toLowerCase();
        }
        var date = new Date(updated_at);
        var options = { month: 'long', day: 'numeric', year: 'numeric' };
        var formattedDate = date.toLocaleDateString("en-US", options);

        container += "<article class='col-6 col-12-xsmall work-item'>";
        container += "<h3><a href='" + svn_url + "'>" + name + "</a></h3>";
        container += "<p>" + description + "</p>";
        if (lcLanguage !== '') {
            container += "<p><span class='" + lcLanguage +"-dot language-dot'></span> "
                + "<span class='" + lcLanguage + "-label'>" + language + "</span> "
                + "| Last Updated: " + formattedDate +" </p>";
        } else {
            container += "<p>Last Updated: " + formattedDate +" </p>";
        }
        container += "</article>";

        return container;
    },

    fetch: function() {
        var self = this;

        self.objJSON({url: self.user_url}, function(user_response) {
            var user_repos = JSON.parse(user_response);
            var reposList = document.querySelector(self.container);

            self.objJSON({url: self.org_url}, function(org_response) {
                var org_repos = JSON.parse(org_response);
                var content = '';
                var i;

                var combined_repos = user_repos.concat(org_repos);
                var sorted_repos = combined_repos.sort(function(a, b) {
                    return new Date(b.updated_at) - new Date(a.updated_at);
                });
                var small_repos = sorted_repos.slice(0, self.count);

                for(i = 0; i < small_repos.length; i++) {
                    content += self.bindTemplate(
                        small_repos[i].name,
                        small_repos[i].description,
                        small_repos[i].svn_url,
                        small_repos[i].language,
                        small_repos[i].updated_at
                    );
                }

                reposList.innerHTML = content;
                self.onComplete();
            });
        });
    }
};
