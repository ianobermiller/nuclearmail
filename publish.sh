#/bin/sh

cp build/* ~/dev/nuclearmail-pages
pushd ~/dev/nuclearmail-pages
git pull && git commit -am "Code update to rev `git rev-parse HEAD`" && git push
popd
