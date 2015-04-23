#!/bin/bash
set -e

readonly SYSTEM=$(uname -s)
EXTRA_STEPS=()
BASEDIR=$(dirname $0)

linux() {
  [[ $SYSTEM == 'Linux' ]]
}

mac() {
  [[ $SYSTEM == 'Darwin' ]]
}

suse() {
  # NOTE: /etc/SuSE-release is deprecated and will be removed in the future
  [[ -f /etc/SuSE-release ]]
}

redhat() {
  [[ -f /etc/redhat-release || -f /etc/centos-release || -f /etc/oracle-release ]]
}

setup_pkgmgr() {
  if suse; then
    echo -n 'zypper -n install -y'
  elif redhat; then
    echo -n 'yum install -y'
  else
    echo -n 'apt-get install -y'
  fi
}

readonly PKGMGR=$(setup_pkgmgr)

pkgmgr() {
  echo -n $PKGMGR
}

installed() {
  hash "$1" 2>/dev/null
}

create_install_vars() {
  local path="/etc/gu"
  local filename="install_vars"

  if [[ ! -f "$path/$filename" ]]; then
    if [[ ! -d "$path" ]]; then
      sudo mkdir "$path"
    fi

    echo "STAGE=DEV" | sudo tee "$path/$filename" > /dev/null
  fi
}

create_frontend_properties() {
  local path="$HOME/.gu"
  local filename="frontend.properties"

  if [[ ! -f "$path/$filename" ]]; then
    if [[ ! -d "$path" ]]; then
      mkdir "$path"
    fi

    touch "$path/$filename"
    EXTRA_STEPS+=("Ask a colleague for frontend.properties and add the contents to $path/$filename")
  fi
}

create_aws_credentials() {
  local path="$HOME/.aws"
  local filename="credentials"

  if [[ ! -f "$path/$filename" ]]; then
    if [[ ! -d "$path" ]]; then
      mkdir "$path"
    fi

    echo "[nextgen]
    aws_access_key_id=[YOUR_AWS_ACCESS_KEY]
    aws_secret_access_key=[YOUR_AWS_SECRET_ACCESS_KEY]
    region=eu-west-1" > "$path/$filename"
    EXTRA_STEPS+=("Add your AWS keys to $path/$filename")
  fi
}

install_homebrew() {
  if mac && ! installed brew; then
    ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"
  fi
}

install_jdk() {
  if ! installed javac; then
    if linux; then
      local JDK=
      if suse; then JDK="java-1_8_0-openjdk-devel"
      elif redhat; then JDK="java-1.8.0-openjdk-devel"
      else JDK="openjdk-7-jdk"
      fi
      sudo $(pkgmgr) $JDK
    elif mac; then
      EXTRA_STEPS+=("Download the JDK from http://www.oracle.com/technetwork/java/javase/downloads/jdk8-downloads-2133151.html")
    fi
  fi
}

install_node() {
  if ! installed node || ! installed npm; then
    if ! installed curl; then
      sudo $(pkgmgr) curl
    fi

    if linux; then
      NODEDEV=
      if redhat; then
        curl -sL https://rpm.nodesource.com/setup | sudo bash -
      elif suse; then
        NODEDEV="nodejs-devel"
      else
        curl -sL https://deb.nodesource.com/setup | sudo bash -
      fi
      sudo $(pkgmgr) nodejs $NODEDEV
    elif mac && installed brew; then
      brew install node
    fi
  fi
}

install_grunt() {
  if ! installed grunt; then
    sudo npm -g install grunt-cli
  fi
}

install_jspm() {
  if ! installed jspm; then
    sudo npm -g install jspm
  fi
}

install_ruby() {
  if linux; then
    local RUBY=
    if suse || redhat; then RUBY="ruby"
    else RUBY="ruby1.9.1-full"
    fi
    sudo $(pkgmgr) $RUBY
  fi
}

install_bundler() {
  if ! installed bundle; then
    if suse; then sudo $(pkgmgr) rubygem-bundler
    else sudo gem install bundler
    fi
  fi
}

install_gcc() {
  if ! installed g++; then
    if linux; then
      local CPP=
      if suse || redhat; then CPP="gcc-c++"
      else CPP="g++"
      fi
      sudo $(pkgmgr) $CPP make
    elif mac; then
      EXTRA_STEPS+=("Install Xcode from the App Store")
    fi
  fi
}

install_libpng() {
  if linux; then
    local LIBPNG=
    # suse 11.x/12.x has libpng14, do it tricky
    if suse; then LIBPNG="libpng16-devel"
    elif redhat; then LIBPNG="libpng-devel"
    else LIBPNG="libpng-dev"
    fi
    sudo $(pkgmgr) $LIBPNG
  elif mac; then
    brew install libpng
  fi
}

install_dependencies() {
  $BASEDIR/install-dependencies.sh
}

compile() {
  grunt compile
}

report() {
  if [[ ${#EXTRA_STEPS[@]} -gt 0 ]]; then
    echo -e
    echo "Remaining tasks: "
    for i in "${!EXTRA_STEPS[@]}"; do
      echo "  $((i+1)). ${EXTRA_STEPS[$i]}"
    done
  fi
}

main() {
  create_install_vars
  create_frontend_properties
  create_aws_credentials
  install_homebrew
  install_jdk
  install_node
  install_gcc
  install_grunt
  install_jspm
  install_ruby
  install_bundler
  install_libpng
  install_dependencies
  compile
  report
}

main
