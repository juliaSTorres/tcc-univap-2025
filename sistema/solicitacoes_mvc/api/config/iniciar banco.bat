@echo off
echo Iniciando túnel SSH para o banco de dados...

:: Conecta via SSH com redirecionamento de porta
:: A senha será pedida se você não usar chave SSH
ssh -L 3306:127.0.0.1:3306 root@31.97.83.24

:: Conecta no MySQL já usando usuário e senha
mysql -u martinelli -p@Leodan1