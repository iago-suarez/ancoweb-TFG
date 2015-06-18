# ancoweb-TFG
[![Build Status](https://travis-ci.org/iago-suarez/ancoweb-TFG.svg?branch=master)](https://travis-ci.org/iago-suarez/ancoweb-TFG)
[![Coverage Status](https://coveralls.io/repos/iago-suarez/ancoweb-TFG/badge.svg?branch=master)](https://coveralls.io/r/iago-suarez/ancoweb-TFG?branch=master)
## Web application for the analysis of human behavior
Ancoweb is a Web application for the analysis of human behavior built with [Python][0] using the [Django Web Framework][1].

This project has the following basic apps:

* accounts - Manage Accounst System
* video_manager - Manage Videos
* video_upload - Manage Video Uploads and video analysis
*integration_tests - Make the integrations test

### Download

To download the source code:

    git clone https://github.com/iago-suarez/ancoweb-TFG

### Quick start

To set up a development environment quickly, first install Python 3.4. It
comes with virtualenv built-in. So create a virtual env by:

In ubuntu 14.04(tested) is necessary:

    $ sudo pip install --upgrade virtualenv
    $ virtualenv-3.4 ancoweb
    $ . ancoweb/bin/activate

In linux in general, it is best:

    $ python3.4 -m venv ancoweb
    $ . ancoweb/bin/activate

Sometimes, binaries like pip get installed inside `local/bin/`. So append
this line to `ancoweb/bin/activate`:

> `PATH="$VIRTUAL_ENV/local/bin:$PATH"`

## Installation

Install the necessary packages, here's an example for ubuntu 14.04:
    sudo apt-add-repository ppa:mc3man/trusty-media
    sudo apt-get update
    sudo apt-get install -y ffmpeg phantomjs python3-pip firefox

Make python 3.4 default python version:

    echo -e "python='/usr/bin/python3.4' \nalias pip='/usr/bin/pip3'" > ~/.bash_aliases

Now restart the terminal and the pip commands should work smoothly. Install all dependencies:

    pip install -r dev-requirements.txt

Run migrations:

    cd src
    python manage.py migrate

Run server:

    python manage.py runserver

### Detailed instructions

Take a look at the docs for a detailed instructions guide.

[0]: https://www.python.org/
[1]: https://www.djangoproject.com/
