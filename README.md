# smartwork-lernhilfe
Lernhilfe für die Auszubildenden der Firma smartwork

Dies ist ein Prototyp einer Lernhilfe für eine Ausbildungsstätte in Frankfurt.


Testen mit Docker
---------------------

**Voraussetzungen:**
- Linux Rechner mit Zugang zum Internet
- Docker installiert

**Schritte:**
- **copy ssl certificate files (cert.pem, chain.pem, privkey.pem) from (in this case) /root/certificate to docker container /root/**:
  > sudo docker cp /root/certificate/. container_name:/root/

- **Docker Container mit folgendem Befehl starten**:
  > sudo docker run -itd -p 80:80 -p 443:443 -e github='https://github.com/BernardTsai/smartwork-lernhilfe.git' jljlg/git-node-test

- **Program nutzen**:

  im Browser die URL "http://localhost:8080/index.html" öffnen


Installation
------------

**Voraussetzungen:**
- Linux Rechner mit Zugang zum Internet
- bash installiert
- git installiert
- node installiert
- SSL Zertifikat Dateien in /root/

**Schritte:**
- **Program klonen**:   

  > git clone https://github.com/BernardTsai/smartwork-lernhilfe.git

- **In das Verzeichnis wechseln**:

  > cd smartwork-lernhilfe

- **Virtuelle Laufzeitumgebung erstellen**:

  > nodeenv --force .

- **Virtuelle Laufzeitumgebung aktivieren**:

  > source bin/activate

- **Bibliotheken installieren**:

  > npm install

- **Program starten**:

  > node index.js

- **Program nutzen**:

  im Browser die URL "http://localhost/" öffnen
