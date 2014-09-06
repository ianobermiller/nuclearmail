#/bin/sh

cp build/* ~/dev/nuclearmail-pages
pushd ~/dev/nuclearmail-pages
git commit -am "Code update" && git push
popd
