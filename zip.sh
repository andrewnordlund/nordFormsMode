rm nordFormsMode.xpi
zip -r nordFormsMode.xpi manifest.json nordFormsMode-bg.js _locales content_scripts icons -x *.swp *.DS_Store "*~"
cp content_scripts/*-bml.js bookmarklet/
