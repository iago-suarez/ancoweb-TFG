# Tutorial para a configuración nun servidor Ubuntu Server 14.04  
## Empregando Python 3, Apache2 mais o módulo mod_wsgi


Para comezar iniciamos sesión como root. Isto podese facer contra un servidor como 45.55.51.164 co comando:
	
	ssh root@45.55.51.164

### Creación de un novo usuario

Para crear un novo usuario chamado django, que conterá o código do proxecto seguimos os seguintes pasos:

	useradd django 
	passwd django 
	mkdir /home/django 
	chown django:django -R /home/django 
	chmod 755 -R /home/django 
	usermod -d /home/django django 

Asegurarse de ter bash como predeterminado para o novo usuario.

	nano /etc/passwd 

Que a liña do usuario novo teña no final /bin/bash e non /bin/sh. Senon cambiala por /bin/bash.

Copiar os arquivos de configuración que creas pertinentes ao novo directorio de usuario, así non terás que arrincar a configurar todo de cero. Por exemplo:
	
	cp -R /home/usuarioviejo/.ssh /home/django/ 

Establecer python3.4 como versión de python predeterminada, é preciso sair logo para que os alias que establecemos neste ficheiro teñan efecto. Tamén se cambiará o propietario da nova carpeta por django (repitese o paso para cambiar todos os aquivos copiados)

	echo -e "alias python='/usr/bin/python3.4' \nalias pip='/usr/bin/pip3' \nalias sudo='sudo '" > /home/django/.bash_aliases
	chown django:django -R /home/django
	exit

### Instalación de dependencias
Volvemos a entrar, pero esta vez co usuario django e instalamos os paquetes precisos tras asegurarnos de que a versión de python por defecto é a 3.4

	python --version
	sudo apt-get install -y python3-pip git libapache2-mod-wsgi-py3 apache2
	sudo pip3 install virtualenv

Descargamos a aplicación e instalamos todas as súas dependencias:

	git clone https://github.com/iago-suarez/ancoweb-TFG
	virtualenv-3.4 ancoweb
	. ancoweb/bin/activate
	sudo apt-add-repository ppa:mc3man/trusty-media
	sudo apt-get update
	sudo apt-get install -y ffmpeg phantomjs python3-pip firefox xvfb
	sudo pip3 install -r ancoweb-TFG/requirements.txt

Agora que temos todas as dependencias instaladar, é hora de poñer en funcionamento a nosa alpicación:

	cd ancoweb-TFG/src/
	python manage.py makemigrations
	python manage.py migrate
	python manage.py test
	python manage.py createsuperuser --username=admin --email=admin@udc.es
	cd RecognitionSystem/
	make CONF=Debug
	cd ..
	
Probamos que o servidor se executa correctamente en modo desenvolvemento, é dicir se empregar as opcións de producción co comando:

	python manage.py runserver

Por último desactivamos o entorno virtual creado anteriormente para pasar a configurar o servidor apache.

	deactivate

### Configurar Apache

Ahora configuraremos o ficheiro /etc/apache2/sites-available/000-default.conf que controla o comportamento do módulo mod_wsgi, que é o encargado de executar dende apache todo o comportamento programado na aplicación django

	<VirtualHost *:80>
	...

	    Alias /static /var/www/static
	    <Directory /var/www/static>
	        Require all granted
	    </Directory>

	    Alias /media /var/www/media
	    <Directory /var/www/media>
	        Require all granted
	    </Directory>

	    <Directory /home/django/ancoweb-TFG/src/ancoweb>
	        <Files wsgi.py>
	            Require all granted
	        </Files>
	    </Directory>

	    WSGIDaemonProcess ancoweb python-path=/home/django/ancoweb-TFG/src:/home/django/ancoweb/lib/python3.4/site-packages
	    WSGIProcessGroup ancoweb
	    WSGIScriptAlias / /home/django/ancoweb-TFG/src/ancoweb/wsgi.py

	</VirtualHost>

Por outra parte sempre podremos botar un vistazo aos erros xerados por Apache no ficheiro de log /var/log/apache2/error.log 

### Asignamos permisos á carpeta ancoweb-TFG

	cd
	sudo chown -R :www-data ~/ancoweb-TFG/
	chmod 664 ~/ancoweb-TFG/src/db.sqlite3
	chmod 755 ~/ancoweb-TFG/
	chmod 775 ~/ancoweb-TFG/src/

### Migramos os datos precisos a /var/www

	sudo su
	. ancoweb/bin/activate
	cd /home/django/ancoweb-TFG/src/
	sudo python manage.py collectstatic --settings=ancoweb.settings_production
	cp -R /home/django/ancoweb-TFG/src/media/ /var/www
	exit

### Damos permisos aos arquivos de /var/www/

	sudo find /var/www/ -type d -exec chmod 775 {} \;
	sudo groupadd varwwwusers
	sudo adduser www-data varwwwusers
	sudo chgrp -R varwwwusers /var/www/
	sudo find /var/www/ -type f -exec chmod 664 {} \;
	sudo service apache2 restart

Se por algún motivo o módulo estivese desactivado, activamolo empregando

	sudo a2enmod wsgi
	sudo service apache2 restart

### Configuración  ssh para a descarga do Sistema de Recoñecemento (Optional)

	ssh-keygen -t rsa -b 4096 -C "xoan.iago.suarez@udc.es"
	eval "$(ssh-agent -s)"
	ssh-add ~/.ssh/id_rsa
	cat .ssh/id_rsa.pub

Engadir no repositorio do sistema de recoñecemento esta clave como clave permitida

### Descargar e instalar o Sistema de Recoñecemento

	cd ~/ancoweb-TFG/src/
	rm -rf RecognitionSystem/
	clone git@github.com:iago-suarez/RecognitionSystem.git
	cd RecognitionSystem/
	sudo apt-get install -y libopencv-dev
	make CONF=Debug
	cp dist/Debug/GNU-Linux-x86/recognitionsystem ./recognitionsystem
	cd ..
	sudo find RecognitionSystem/ -type d -exec chmod 775 {} \;
	sudo find RecognitionSystem/ -type f -exec chmod 664 {} \;
	sudo chgrp -R varwwwusers RecognitionSystem/
	sudo service apache2 restart

Con isto todo debería estar listo para acceder á dirección do noso servidor e poder disfrutar no navegador da aplicación.

