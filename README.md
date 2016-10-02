# pikapi

A pluggable API framework for Nightbot APIs.

The `api.js` module starts a basic HTTP server on port 6749 and loads any modules in the `scripts/` folder. You may use the `npm start` command to boot it up.

Each module in `scripts/` adds a request handler and maps it to an endpoint. Modules must follow this pattern:

    module.exports = {
        endpoint: '/pick-random-line',
        requestHandler: function(request, response, callback) {
            // handle request...
            response.write(str);
            callback();
        }
    };

API responses are always plain text and always return a 200 status code (as per the Nightbot spec).

## APIs

### Amazon URL builder

Takes an Amazon URL and adds an [Amazon Associate Tag](http://docs.aws.amazon.com/AWSECommerceService/latest/DG/becomingAssociate.html) to it. Supports all Amazon marketplaces in addition to subdomains such as `smile.amazon.com`, `read.amazon.com`, etc.

#### Example ####

**Request:**

    http://localhost:6749/build-amazon-url?tag=associate-20&url=https://smile.amazon.com/dp/B000SEGUDE

**Response:**

    https://smile.amazon.com/dp/B000SEGUDE?tag=associate-20

### List ###

Displays a remote text file line by line, with a line number preceding each line. This is useful for quote systems where you want to be able to recall a specific quote by its number.

#### Example ####

**Request:**

    http://localhost:6749/list?url=https://www.dropbox.com/s/abcdef0123456789/quotes.txt?dl=1

**Response:**

    1 : Fear makes companions of us all.
    2 : There are some corners of the universe which have bred the most terrible things. Things that act against everything we believe in. They must be fought!
    3 : I reversed the polarity of the neutron flow.
    4 : There's no point being grown-up if you can't be childish sometimes.
    5 : Brave heart, Tegan.
    6 : A little gratitude wouldn't irretrievably damage my ego.
    7 : Your species has the most amazing capacity for self-deception, matched only by its ingenuity when trying to destroy itself.
    8 : I love humans. Always seeing patterns in things that aren't there.
    9 : Just this once...Everybody lives!!
    10: Never say never ever.
    11: Do you know, in 900 years of time and space, I've never met anyone who wasn't important before?
    12: Winning is all about looking happier than the other guy.

### Pick random line ###

Reads a remote file line by line and displays a random line. You can also display a specific line by its line number, or pick a random line containing a specific string.

#### Example: random line ####

**Request:**

    http://localhost:6749/pick-random-line?url=https://www.dropbox.com/s/abcdef0123456789/quotes.txt?dl=1

**Response:**

    There's no point being grown-up if you can't be childish sometimes.

#### Example: line by number ####

**Request:**

    http://localhost:6749/pick-random-line?line=9&url=https://www.dropbox.com/s/abcdef0123456789/quotes.txt?dl=1

**Response:**

    Just this once...Everybody lives!!

#### Example: line by keyword ####

**Request:**

    http://localhost:6749/pick-random-line?line=polarity&url=https://www.dropbox.com/s/abcdef0123456789/quotes.txt?dl=1

**Response:**

    I reversed the polarity of the neutron flow.

### Tracery ###

Loads a [Tracery](https://github.com/galaxykate/tracery) grammar from a remote JSON, CSON or YAML file and outputs a randomly generated sentence built from that grammar.

#### Example ####

**grammar.cson:**

    animal: [
        'panda',
        'fox',
        'capybara',
        'iguana'
    ]
    emotion: [
        'sad',
        'happy',
        'angry',
        'jealous'
    ]
    origin: [
        'I am #emotion.a# #animal#.'
    ]

**Request:**

    http://localhost:6749/tracery?format=cson&url=https://www.dropbox.com/s/abcdef0123456789/grammar.txt?dl=1

**Response:**

    I am a sad capybara.

## Environment variables

Pikapi supports [dotenv](https://github.com/motdotla/dotenv) for environment variables.

  * `PORT` - the HTTP port (default: `6749`)
  * `MAX_REMOTE_FILE_SIZE` - file size limit for remote files in bytes (defaults vary)

## TODO

  * OAuth
  * Profiling
  * Cache results
  * Abstract away common stuff (remote file loading, file size checking, URL parsing)
