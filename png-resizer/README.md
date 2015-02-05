# Image Resizer
## Creating the RPM
- create a new AWS instance from the PNG resizer image
- install lzip http://pkgs.org/download/lzip
- yum install libwebp-devel
- download imagemagick source and untar
- ./configure --with-webp=yes
- check the log shows --with-webp=yes yes
- make
- ./utilities/identify -list format|grep -i webp
- make sure webp appears in the above output
- yum install rpm-build
- sudo yum install libtool-ltdl-devel
- yum install perl-ExtUtils-MakeMaker
- yum install ghostscript
- yum install fontconfig fontconfig-devel freetype freetype-devel
- make rpm
