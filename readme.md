API PPG
Este proyecto consiste en un sistema que se comunica con básculas a través de puertos seriales utilizando hardware Quatech. La información recibida de las básculas se emite a través de WebSockets, permitiendo una integración eficiente con otras aplicaciones y sistemas.

Instalación
Antes de ejecutar la aplicación, asegúrate de tener Node.js instalado en tu sistema.

Clona este repositorio:
git clone https://github.com/cdberrio5/API-PPG.git

Navega al directorio del proyecto:
cd nombre-del-proyecto

Instala las dependencias:
npm i

Para iniciar la aplicación, utiliza el siguiente comando:
npm start
Este comando instalará PM2 (si aún no está instalado), iniciará el script con PM2 y lo guardará para asegurar su reinicio automático después de un reinicio del sistema.

Detener la Aplicación
Para detener la aplicación y liberar los recursos, puedes utilizar el siguiente comando:
npm run kill
Este comando detendrá el servicio utilizando PM2 y lo eliminará del sistema.

Licencia
Este proyecto está bajo la Licencia [Nombre de la Licencia]. Consulta el archivo LICENSE para obtener más detalles.

¡Gracias por utilizar nuestro proyecto! Si tienes alguna pregunta o problema, no dudes en crear un issue.