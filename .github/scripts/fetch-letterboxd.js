const https = require('https');
const fs = require('fs');
const path = require('path');
const { DOMParser } = require('@xmldom/xmldom');

const LETTERBOXD_USERNAME = 'RommelTJ';
const RSS_URL = `https://letterboxd.com/${LETTERBOXD_USERNAME}/rss/`;
const OUTPUT_PATH = path.join(__dirname, '../../assets/data/letterboxd.json');

function fetchRSS(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                if (res.statusCode === 200) {
                    resolve(data);
                } else {
                    reject(new Error(`Failed to fetch RSS feed: ${res.statusCode}`));
                }
            });
        }).on('error', (err) => {
            reject(err);
        });
    });
}

function parseRating(rating) {
    if (!rating || rating === '') {
        return '';
    }
    const numRating = parseFloat(rating);
    const ratingText = numRating.toString();
    if (numRating === 1) {
        return ratingText + ' Star';
    } else {
        return ratingText + ' Stars';
    }
}

function parseDate(dateString) {
    const date = new Date(dateString);
    const options = { month: 'long', day: 'numeric', year: 'numeric' };
    return date.toLocaleDateString("en-US", options);
}

function extractImageFromDescription(description) {
    if (!description) return '';

    // Simple regex to extract image src from description
    const imgMatch = description.match(/<img[^>]+src="([^">]+)"/);
    return imgMatch ? imgMatch[1] : '';
}

function getElementText(element, tagName, namespace = '*') {
    if (!element) return '';

    let elements;
    if (namespace === null) {
        // For standard RSS elements, use getElementsByTagName
        elements = element.getElementsByTagName(tagName);
    } else {
        // For namespaced elements (like letterboxd:filmTitle), use getElementsByTagNameNS
        elements = element.getElementsByTagNameNS(namespace, tagName);
    }
    return elements && elements.length > 0 ? elements[0].textContent : '';
}

function parseXMLFeed(xmlString) {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, "text/xml");

    const items = xmlDoc.getElementsByTagName('item');
    const films = [];

    for (let i = 0; i < items.length; i++) {
        const item = items[i];

        // Extract film data from custom letterboxd namespace
        const filmTitle = getElementText(item, 'filmTitle');
        const filmYear = getElementText(item, 'filmYear');
        const memberRating = getElementText(item, 'memberRating');
        const watchedDate = getElementText(item, 'watchedDate');

        // Extract standard RSS elements (no namespace)
        const linkElements = item.getElementsByTagName('link');
        const descElements = item.getElementsByTagName('description');

        const link = linkElements && linkElements.length > 0 ? linkElements[0].textContent.trim() : '';
        const description = descElements && descElements.length > 0 ? descElements[0].textContent : '';

        const film = {
            title: filmTitle,
            year: filmYear,
            rating: parseRating(memberRating),
            watchedDate: watchedDate ? parseDate(watchedDate) : '',
            watchedDateRaw: watchedDate,
            poster: extractImageFromDescription(description),
            link: link
        };

        films.push(film);
    }

    // Sort by watched date in descending order (most recent first)
    films.sort((a, b) => {
        return new Date(b.watchedDateRaw) - new Date(a.watchedDateRaw);
    });

    return films;
}

async function main() {
    try {
        console.log(`Fetching Letterboxd RSS feed for ${LETTERBOXD_USERNAME}...`);
        const xmlData = await fetchRSS(RSS_URL);

        console.log('Parsing RSS feed...');
        const films = parseXMLFeed(xmlData);

        console.log(`Found ${films.length} films`);

        // Ensure output directory exists
        const outputDir = path.dirname(OUTPUT_PATH);
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        // Write JSON file
        fs.writeFileSync(OUTPUT_PATH, JSON.stringify(films, null, 2), 'utf8');
        console.log(`Successfully wrote feed data to ${OUTPUT_PATH}`);

    } catch (error) {
        console.error('Error fetching Letterboxd feed:', error);
        process.exit(1);
    }
}

main();
