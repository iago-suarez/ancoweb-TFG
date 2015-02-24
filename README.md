# ancoweb-TFG
## Web application for the analysis of human behavior
Ancoweb is a Web application for the analysis of human behavior built with [Python][0] using the [Django Web Framework][1].

This project has the following basic apps:

* accounts - Manage Accounst System

## Installation


### Download

To download the source code:

    git clone https://github.com/iago-suarez/ancoweb-TFG

### Quick start

To set up a development environment quickly, first install Python 3.4. It
comes with virtualenv built-in. So create a virtual env by:

    $ python3.4 -m venv ancoweb
    $ . ancoweb/bin/activate

> Sometimes, binaries like pip get installed inside `local/bin/`. So append
> this line to `ancoweb/bin/activate`:
>
> `PATH="$VIRTUAL_ENV/local/bin:$PATH"`

Now the pip commands should work smoothly. Install all dependencies:

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